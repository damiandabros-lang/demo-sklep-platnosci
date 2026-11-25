import { PRODUKTY, type Produkt } from "./produkty.ts";

export type Pozycja = { slug: string; ilosc: number };
export type Linia = { produkt: Produkt; ilosc: number; bruttoGr: number; nettoGr: number; vatGr: number };
export type Podsumowanie = { linie: Linia[]; bruttoGr: number; nettoGr: number; vatGr: number; dostawaGr: number; doZaplatyGr: number; vatWgStawek: Record<string, number> };

export const DOSTAWA_GR = 1499;
export const DARMOWA_OD_GR = 15000;

/** Netto z brutto zaokrąglane per linia (metoda „od brutto”, jak na paragonie). */
export function nettoZBrutto(bruttoGr: number, vat: number): number {
  return Math.round((bruttoGr * 100) / (100 + vat));
}

export function zl(gr: number): string {
  return (gr / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
}

/** Normalizuje koszyk: znane produkty, ilość 1..stan (max 10), bez duplikatów. */
export function normalizuj(pozycje: Pozycja[]): Pozycja[] {
  const m = new Map<string, number>();
  for (const p of pozycje) {
    const prod = PRODUKTY.find((x) => x.slug === p.slug);
    if (!prod || prod.stan <= 0) continue;
    const il = Math.floor(Number(p.ilosc)) || 0;
    m.set(p.slug, Math.min((m.get(p.slug) ?? 0) + il, prod.stan, 10));
  }
  return [...m].filter(([, il]) => il > 0).map(([slug, ilosc]) => ({ slug, ilosc }));
}

export function podsumuj(pozycje: Pozycja[]): Podsumowanie {
  const linie: Linia[] = normalizuj(pozycje).map(({ slug, ilosc }) => {
    const produkt = PRODUKTY.find((x) => x.slug === slug)!;
    const bruttoGr = produkt.cenaBruttoGr * ilosc;
    const nettoGr = nettoZBrutto(bruttoGr, produkt.vat);
    return { produkt, ilosc, bruttoGr, nettoGr, vatGr: bruttoGr - nettoGr };
  });
  const bruttoGr = linie.reduce((s, l) => s + l.bruttoGr, 0);
  const nettoGr = linie.reduce((s, l) => s + l.nettoGr, 0);
  const vatWgStawek: Record<string, number> = {};
  for (const l of linie) vatWgStawek[`${l.produkt.vat}%`] = (vatWgStawek[`${l.produkt.vat}%`] ?? 0) + l.vatGr;
  const dostawaGr = bruttoGr === 0 || bruttoGr >= DARMOWA_OD_GR ? 0 : DOSTAWA_GR;
  return { linie, bruttoGr, nettoGr, vatGr: bruttoGr - nettoGr, dostawaGr, doZaplatyGr: bruttoGr + dostawaGr, vatWgStawek };
}

export function zakoduj(p: Pozycja[]): string {
  return normalizuj(p).map((x) => `${x.slug}:${x.ilosc}`).join(",");
}
export function odkoduj(s: string | undefined): Pozycja[] {
  if (!s) return [];
  return normalizuj(s.split(",").map((x) => { const [slug, il] = x.split(":"); return { slug, ilosc: Number(il) }; }));
}
