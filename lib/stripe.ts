import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimalna integracja Stripe (tryb TESTOWY) bez SDK: Checkout Session + weryfikacja podpisu webhooka.
 * Klucz musi zaczynać się od sk_test_ – klucze produkcyjne są odrzucane.
 */
export function kluczTestowy(): string | null {
  const k = process.env.STRIPE_SECRET_KEY ?? "";
  return k.startsWith("sk_test_") ? k : null;
}

export async function utworzSesje(o: { idZamowienia: string; kwotaGr: number; email: string; baseUrl: string }): Promise<{ url: string; id: string }> {
  const key = kluczTestowy();
  if (!key) throw new Error("Brak testowego klucza Stripe");
  const body = new URLSearchParams({
    mode: "payment",
    "payment_method_types[0]": "card",
    "payment_method_types[1]": "blik",
    "payment_method_types[2]": "p24",
    customer_email: o.email,
    client_reference_id: o.idZamowienia,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "pln",
    "line_items[0][price_data][unit_amount]": String(o.kwotaGr),
    "line_items[0][price_data][product_data][name]": `Zamówienie ${o.idZamowienia} (DEMO)`,
    success_url: `${o.baseUrl}/zamowienie/${o.idZamowienia}?wynik=ok`,
    cancel_url: `${o.baseUrl}/zamowienie/${o.idZamowienia}?wynik=anulowano`,
    "metadata[zamowienie]": o.idZamowienia,
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  if (!r.ok) throw new Error(`Stripe ${r.status}`);
  const j = (await r.json()) as { url: string; id: string };
  return { url: j.url, id: j.id };
}

/** Weryfikacja nagłówka Stripe-Signature (t=...,v1=...) z tolerancją czasu. */
export function weryfikujPodpis(payload: string, naglowek: string | null, sekret: string, teraz = Math.floor(Date.now() / 1000), tolerancja = 300): boolean {
  if (!naglowek || !sekret) return false;
  const czesci = Object.fromEntries(naglowek.split(",").map((x) => x.split("=") as [string, string]));
  const t = Number(czesci.t);
  if (!t || Math.abs(teraz - t) > tolerancja) return false;
  const oczek = createHmac("sha256", sekret).update(`${t}.${payload}`).digest("hex");
  const podpisy = naglowek.split(",").filter((x) => x.startsWith("v1=")).map((x) => x.slice(3));
  return podpisy.some((p) => p.length === oczek.length && timingSafeEqual(Buffer.from(p), Buffer.from(oczek)));
}
