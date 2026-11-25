import { weryfikujPodpis } from "@/lib/stripe";
import { ustawStatus, pobierz } from "@/lib/zamowienia";

/** Webhook Stripe: checkout.session.completed / expired → status zamówienia. Weryfikacja podpisu obowiązkowa. */
export async function POST(req: Request) {
  const payload = await req.text();
  const sekret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!weryfikujPodpis(payload, req.headers.get("stripe-signature"), sekret)) return new Response("Nieprawidłowy podpis", { status: 400 });
  const ev = JSON.parse(payload) as { type: string; data: { object: { client_reference_id?: string; amount_total?: number; payment_status?: string } } };
  const id = ev.data.object.client_reference_id ?? "";
  const z = pobierz(id);
  if (!z) return Response.json({ ok: true, pominieto: "nieznane zamówienie" });
  if (ev.type === "checkout.session.completed" && ev.data.object.payment_status === "paid") {
    if (ev.data.object.amount_total !== z.doZaplatyGr) return new Response("Kwota się nie zgadza", { status: 409 });
    ustawStatus(id, "oplacone", "Płatność potwierdzona przez Stripe (tryb testowy)");
  } else if (ev.type === "checkout.session.expired") {
    ustawStatus(id, "anulowane", "Sesja płatności wygasła (Stripe)");
  }
  return Response.json({ ok: true });
}
