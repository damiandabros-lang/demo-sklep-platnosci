export type Produkt = { slug: string; nazwa: string; opis: string; cenaBruttoGr: number; vat: 23 | 8 | 5; stan: number; kolor: string };

/** Fikcyjny asortyment sklepu demonstracyjnego. Ceny w groszach (brutto). */
export const PRODUKTY: Produkt[] = [
  { slug: "kubek-ceramiczny", nazwa: "Kubek ceramiczny „Przykładowo”", opis: "Kubek 330 ml, nadaje się do zmywarki.", cenaBruttoGr: 3900, vat: 23, stan: 25, kolor: "#0b4f8a" },
  { slug: "notes-a5", nazwa: "Notes A5 w kropki", opis: "96 kartek, papier 100 g/m², okładka z recyklingu.", cenaBruttoGr: 2450, vat: 23, stan: 40, kolor: "#1e6b34" },
  { slug: "przewodnik", nazwa: "Przewodnik po fikcyjnej dolinie", opis: "Książka, 120 stron, mapy i trasy rowerowe.", cenaBruttoGr: 4990, vat: 5, stan: 12, kolor: "#8a1c14" },
  { slug: "torba-lniana", nazwa: "Torba lniana", opis: "Naturalny len, długie ucha, nadruk sitodrukiem.", cenaBruttoGr: 5500, vat: 23, stan: 0, kolor: "#5a2d82" },
  { slug: "miod-lipowy", nazwa: "Miód lipowy 400 g", opis: "Produkt przykładowy – w demo nie sprzedajemy żywności.", cenaBruttoGr: 3200, vat: 8, stan: 30, kolor: "#8a5a00" },
];
export const produkt = (slug: string) => PRODUKTY.find((p) => p.slug === slug);
