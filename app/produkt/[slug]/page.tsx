import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUKTY, produkt } from "@/lib/produkty";
import { zl } from "@/lib/koszyk";
import { dodaj } from "../../actions";

export function generateStaticParams() { return PRODUKTY.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = produkt((await params).slug); return { title: p?.nazwa, description: p?.opis };
}

export default async function Strona({ params }: { params: Promise<{ slug: string }> }) {
  const p = produkt((await params).slug);
  if (!p) notFound();
  return (
    <>
      <nav aria-label="Okruszki"><a href="/">Produkty</a> › <span aria-current="page">{p.nazwa}</span></nav>
      <h1>{p.nazwa}</h1>
      <svg className="prod-img" style={{ maxWidth: "24rem" }} viewBox="0 0 160 120" role="img" aria-label={`Ilustracja produktu: ${p.nazwa}`}><rect width="160" height="120" fill={p.kolor} /><circle cx="80" cy="60" r="28" fill="#fff" opacity=".85" /></svg>
      <p>{p.opis}</p>
      <p className="price">{zl(p.cenaBruttoGr)} <span className="hint">brutto, VAT {p.vat}%</span></p>
      <p>Dostępność: {p.stan > 0 ? `${p.stan} szt.` : "chwilowo niedostępny"}</p>
      {p.stan > 0 && (
        <form action={dodaj} className="row">
          <input type="hidden" name="slug" value={p.slug} />
          <div className="field"><label htmlFor="ilosc">Ilość</label><input className="qty" id="ilosc" name="ilosc" type="number" min={1} max={Math.min(10, p.stan)} defaultValue={1} /></div>
          <div className="field"><button className="btn" type="submit">Dodaj do koszyka</button></div>
        </form>
      )}
    </>
  );
}
