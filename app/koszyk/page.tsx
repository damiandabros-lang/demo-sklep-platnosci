import type { Metadata } from "next";
import { Fragment } from "react";
import { cookies } from "next/headers";
import { odkoduj, podsumuj, zl } from "@/lib/koszyk";
import { kluczTestowy } from "@/lib/stripe";
import { produkt } from "@/lib/produkty";
import { zmien, usun } from "../actions";
import { ZamowienieForm } from "./zamowienie-form";

export const metadata: Metadata = { title: "Koszyk" };

export default async function Koszyk({ searchParams }: { searchParams: Promise<{ dodano?: string; usunieto?: string }> }) {
  const sp = await searchParams;
  const s = podsumuj(odkoduj((await cookies()).get("koszyk")?.value));
  const dodany = sp.dodano ? produkt(sp.dodano) : undefined;
  return (
    <>
      <h1>Koszyk</h1>
      <div role="status">
        {dodany && <p className="success">Dodano do koszyka: {dodany.nazwa}.</p>}
        {sp.usunieto && <p className="success">Usunięto produkt z koszyka.</p>}
      </div>
      {s.linie.length === 0 ? <p>Koszyk jest pusty. <a href="/">Przejdź do produktów</a>.</p> : (
        <>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Zawartość koszyka – na małym ekranie przewiń w poziomie">
            <table>
              <caption>Produkty w koszyku</caption>
              <thead><tr><th scope="col">Produkt</th><th scope="col">Ilość</th><th scope="col" className="num">Wartość brutto</th><th scope="col">Akcje</th></tr></thead>
              <tbody>
                {s.linie.map((l) => (
                  <tr key={l.produkt.slug}>
                    <th scope="row">{l.produkt.nazwa}</th>
                    <td>
                      <form action={zmien} className="row">
                        <input type="hidden" name="slug" value={l.produkt.slug} />
                        <label className="sr-only" htmlFor={`il-${l.produkt.slug}`}>Ilość: {l.produkt.nazwa}</label>
                        <input className="qty" id={`il-${l.produkt.slug}`} name="ilosc" type="number" min={1} max={Math.min(10, l.produkt.stan)} defaultValue={l.ilosc} />
                        <button className="linkbtn" type="submit">Zmień<span className="sr-only"> ilość: {l.produkt.nazwa}</span></button>
                      </form>
                    </td>
                    <td className="num">{zl(l.bruttoGr)}</td>
                    <td><form action={usun}><input type="hidden" name="slug" value={l.produkt.slug} /><button className="linkbtn" type="submit">Usuń<span className="sr-only">: {l.produkt.nazwa}</span></button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <section className="summary" aria-labelledby="podsum-h">
            <h2 id="podsum-h" style={{ marginTop: 0 }}>Podsumowanie</h2>
            <dl>
              <dt>Wartość netto</dt><dd>{zl(s.nettoGr)}</dd>
              {Object.entries(s.vatWgStawek).map(([st, v]) => <Fragment key={st}><dt>VAT {st}</dt><dd>{zl(v)}</dd></Fragment>)}
              <dt>Produkty brutto</dt><dd>{zl(s.bruttoGr)}</dd>
              <dt>Dostawa</dt><dd>{s.dostawaGr ? zl(s.dostawaGr) : "gratis"}</dd>
              <dt className="total">Do zapłaty</dt><dd className="total">{zl(s.doZaplatyGr)}</dd>
            </dl>
          </section>
          <h2>Dane do zamówienia</h2>
          <ZamowienieForm stripe={kluczTestowy() !== null} />
        </>
      )}
    </>
  );
}
