"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { odkoduj, zakoduj, podsumuj } from "@/lib/koszyk";
import { nowe, ustawStatus, pobierz } from "@/lib/zamowienia";
import { kluczTestowy, utworzSesje } from "@/lib/stripe";

const OPCJE = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7, secure: process.env.NODE_ENV === "production" };

async function koszyk() { return odkoduj((await cookies()).get("koszyk")?.value); }
async function zapiszKoszyk(v: string) { (await cookies()).set("koszyk", v, OPCJE); }

export async function dodaj(fd: FormData) {
  const slug = String(fd.get("slug")); const ilosc = Number(fd.get("ilosc") ?? 1);
  await zapiszKoszyk(zakoduj([...(await koszyk()), { slug, ilosc }]));
  redirect("/koszyk?dodano=" + encodeURIComponent(slug));
}

export async function zmien(fd: FormData) {
  const slug = String(fd.get("slug")); const ilosc = Number(fd.get("ilosc"));
  await zapiszKoszyk(zakoduj((await koszyk()).map((p) => (p.slug === slug ? { slug, ilosc } : p))));
  redirect("/koszyk");
}

export async function usun(fd: FormData) {
  const slug = String(fd.get("slug"));
  await zapiszKoszyk(zakoduj((await koszyk()).filter((p) => p.slug !== slug)));
  redirect("/koszyk?usunieto=1");
}

export type StanZamowienia = { bledy: Record<string, string>; wartosci: Record<string, string> };

export async function zamow(_prev: StanZamowienia, fd: FormData): Promise<StanZamowienia> {
  const w = { imie: String(fd.get("imie") ?? "").trim(), email: String(fd.get("email") ?? "").trim(), ulica: String(fd.get("ulica") ?? "").trim(), kod: String(fd.get("kod") ?? "").trim(), miasto: String(fd.get("miasto") ?? "").trim(), metoda: String(fd.get("metoda") ?? "symulacja") };
  const b: Record<string, string> = {};
  if (w.imie.length < 3) b.imie = "Podaj imię i nazwisko.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(w.email)) b.email = "Podaj poprawny adres e-mail.";
  if (w.ulica.length < 3) b.ulica = "Podaj ulicę i numer.";
  if (!/^\d{2}-\d{3}$/.test(w.kod)) b.kod = "Kod pocztowy w formacie 00-000.";
  if (w.miasto.length < 2) b.miasto = "Podaj miejscowość.";
  if (!fd.get("regulamin")) b.regulamin = "Zaakceptuj regulamin sklepu demo.";
  const poz = await koszyk();
  const s = podsumuj(poz);
  if (s.linie.length === 0) b.koszyk = "Koszyk jest pusty.";
  if (Object.keys(b).length) return { bledy: b, wartosci: w };

  const stripe = w.metoda === "stripe" && kluczTestowy() !== null;
  // Zapisujemy tylko to, co potrzebne do pokazania statusu – bez adresu ulicy i kodu.
  const z = nowe({ pozycje: poz, doZaplatyGr: s.doZaplatyGr, email: w.email, imie: w.imie.split(" ")[0], miasto: w.miasto, metoda: stripe ? "stripe" : "symulacja" });
  await zapiszKoszyk("");
  if (stripe) {
    const h = await headers();
    const base = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    const sesja = await utworzSesje({ idZamowienia: z.id, kwotaGr: z.doZaplatyGr, email: z.email, baseUrl: base });
    redirect(sesja.url);
  }
  redirect(`/zamowienie/${z.id}`);
}

/** Symulowana bramka płatności (gdy brak testowego klucza Stripe). */
export async function symuluj(fd: FormData) {
  const id = String(fd.get("id")); const wynik = String(fd.get("wynik"));
  const z = pobierz(id);
  if (z && z.metoda === "symulacja" && z.status === "oczekuje_na_platnosc") {
    if (wynik === "ok") ustawStatus(id, "oplacone", "Płatność zaakceptowana (symulacja)");
    else ustawStatus(id, "anulowane", "Płatność odrzucona (symulacja)");
  }
  redirect(`/zamowienie/${id}`);
}
