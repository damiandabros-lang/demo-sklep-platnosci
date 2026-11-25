import { PRODUKTY } from "@/lib/produkty";
import { zl } from "@/lib/koszyk";
import { dodaj } from "./actions";

export default function Produkty() {
  return (
    <>
      <h1>Produkty</h1>
      <p>Sklep demonstracyjny: koszyk, zamówienie z walidacją, podsumowanie VAT według stawek i płatność w trybie testowym przez wbudowaną symulację bramki (kod obsługuje też Stripe w trybie testowym – karta, BLIK, Przelewy24 – na tej instancji wyłączony).</p>
      <ul className="grid">
        {PRODUKTY.map((p) => (
          <li key={p.slug} className="card">
            <svg className="prod-img" viewBox="0 0 160 120" role="img" aria-label={`Ilustracja produktu: ${p.nazwa}`}><rect width="160" height="120" fill={p.kolor} /><circle cx="80" cy="60" r="28" fill="#fff" opacity=".85" /></svg>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}><a href={`/produkt/${p.slug}`}>{p.nazwa}</a></h2>
            <p className="price">{zl(p.cenaBruttoGr)} <span className="hint">brutto, VAT {p.vat}%</span></p>
            {p.stan > 0 ? (
              <form action={dodaj}>
                <input type="hidden" name="slug" value={p.slug} />
                <input type="hidden" name="ilosc" value="1" />
                <button className="btn" type="submit">Dodaj do koszyka<span className="sr-only">: {p.nazwa}</span></button>
              </form>
            ) : <p><strong>Chwilowo niedostępny</strong></p>}
          </li>
        ))}
      </ul>
    </>
  );
}
