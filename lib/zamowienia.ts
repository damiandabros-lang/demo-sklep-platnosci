import { mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import type { Pozycja } from "./koszyk.ts";

export type Status = "oczekuje_na_platnosc" | "oplacone" | "anulowane";
export type Zamowienie = { id: string; utworzono: string; pozycje: Pozycja[]; doZaplatyGr: number; email: string; imie: string; miasto: string; metoda: "symulacja" | "stripe"; status: Status; historia: { kiedy: string; opis: string }[] };

const DIR = process.env.DATA_DIR ?? join(process.cwd(), ".data");
const FILE = join(DIR, "zamowienia.json");

function wczytaj(): Record<string, Zamowienie> {
  try { return JSON.parse(readFileSync(FILE, "utf8")); } catch { return {}; }
}
function zapisz(db: Record<string, Zamowienie>) {
  mkdirSync(DIR, { recursive: true });
  // DEMO: przechowujemy max. 500 ostatnich zamówień, bez adresów i telefonów.
  const ostatnie = Object.fromEntries(Object.entries(db).sort((a, b) => b[1].utworzono.localeCompare(a[1].utworzono)).slice(0, 500));
  writeFileSync(FILE + ".tmp", JSON.stringify(ostatnie));
  renameSync(FILE + ".tmp", FILE);
}

export function nowe(z: Omit<Zamowienie, "id" | "utworzono" | "status" | "historia">): Zamowienie {
  const db = wczytaj();
  const id = "Z" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + randomBytes(3).toString("hex").toUpperCase();
  const teraz = new Date().toISOString();
  const zam: Zamowienie = { ...z, id, utworzono: teraz, status: "oczekuje_na_platnosc", historia: [{ kiedy: teraz, opis: "Złożono zamówienie" }] };
  db[id] = zam; zapisz(db); return zam;
}
export const pobierz = (id: string): Zamowienie | undefined => wczytaj()[id];
export function ustawStatus(id: string, status: Status, opis: string): Zamowienie | undefined {
  const db = wczytaj(); const z = db[id];
  if (!z) return undefined;
  if (z.status === status) return z; // idempotentnie (np. powtórzony webhook)
  z.status = status; z.historia.push({ kiedy: new Date().toISOString(), opis });
  zapisz(db); return z;
}
