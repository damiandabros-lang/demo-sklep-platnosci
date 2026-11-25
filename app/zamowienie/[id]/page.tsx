import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pobierz } from "@/lib/zamowienia";
import { podsumuj, zl } from "@/lib/koszyk";
import { symuluj } from "../../actions";

export const metadata: Metadata = { title: "Zamówienie" };
export const dynamic = "force-dynamic";
const NAZWY = { oczekuje_na_platnosc: "Oczekuje na płatność", oplacone: "Opłacone", anulowane: "Anulowane / odrzucone" };

export default async function Zamowienie({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ wynik?: string }> }) {
  const { id } = await params; const { wynik } = await searchParams;
  const z = pobierz(id);
  if (!z) notFound();
  const s = podsumuj(z.pozycje);
  return (
    <>
      <h1>Zamówienie {z.id}</h1>
      <p role="status">Status: <span className="status">{NAZWY[z.status]}</span></p>
      {z.metoda === "stripe" && wynik === "ok" && z.status !== "oplacone" && <p className="hint">Płatność testowa zakończona – czekamy na potwierdzenie (webhook Stripe). Odśwież stronę za chwilę.</p>}
      {z.metoda === "stripe" && wynik === "anulowano" && <p className="hint">Płatność anulowana w Stripe (tryb testowy).</p>}
      <p>Do zapłaty: <strong>{zl(z.doZaplatyGr)}</strong> · Zamawiający: {z.imie}, {z.miasto}</p>
      <ul>{s.linie.map((l) => <li key={l.produkt.slug}>{l.produkt.nazwa} × {l.ilosc} – {zl(l.bruttoGr)}</li>)}</ul>
      {z.metoda === "symulacja" && z.status === "oczekuje_na_platnosc" && (
        <section aria-labelledby="bramka-h" className="summary">
          <h2 id="bramka-h" style={{ marginTop: 0 }}>Symulowana bramka płatności</h2>
          <p>To nie jest prawdziwa płatność. Wybierz wynik, aby zobaczyć obsługę statusów.</p>
          <div className="row">
            <form action={symuluj}><input type="hidden" name="id" value={z.id} /><input type="hidden" name="wynik" value="ok" /><button className="btn" type="submit">Zapłać (sukces)</button></form>
            <form action={symuluj}><input type="hidden" name="id" value={z.id} /><input type="hidden" name="wynik" value="blad" /><button className="btn btn-ghost" type="submit">Odrzuć płatność</button></form>
          </div>
        </section>
      )}
      <h2>Historia</h2>
      <ol>{z.historia.map((h) => <li key={h.kiedy + h.opis}><time dateTime={h.kiedy}>{new Date(h.kiedy).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</time> – {h.opis}</li>)}</ol>
      <p><a href="/">Wróć do produktów</a></p>
    </>
  );
}
