import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { odkoduj } from "@/lib/koszyk";

export const metadata: Metadata = {
  title: { default: "Sklep Przykładowo (DEMO)", template: "%s – Sklep Przykładowo (DEMO)" },
  description: "DEMO Isvero Studio: sklep internetowy z koszykiem i płatnościami w trybie testowym. Dane i produkty fikcyjne.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ilosc = odkoduj((await cookies()).get("koszyk")?.value).reduce((s, p) => s + p.ilosc, 0);
  return (
    <html lang="pl">
      <body>
        <a className="skip-link" href="#zawartosc">Przejdź do treści</a>
        <div className="demo-bar" role="region" aria-label="Informacja o wersji demonstracyjnej">
          <p><span className="badge">DEMO</span>Sklep pokazowy <a href="https://isverostudio.com/">Isvero Studio</a> (2026). Produkty są fikcyjne, a płatności działają wyłącznie w trybie testowym – nic nie zostanie sprzedane ani obciążone.</p>
        </div>
        <header className="site">
          <div className="wrap">
            <a className="brand" href="/">Sklep Przykładowo<small>sklep demonstracyjny</small></a>
            <nav aria-label="Menu główne"><ul>
              <li><a href="/">Produkty</a></li>
              <li><a href="/koszyk">Koszyk ({ilosc})<span className="sr-only"> — liczba produktów</span></a></li>
              <li><a href="/regulamin">Regulamin (demo)</a></li>
            </ul></nav>
          </div>
        </header>
        <main id="zawartosc" className="wrap" tabIndex={-1}>{children}</main>
        <footer className="site"><div className="wrap"><p>DEMO portfolio Isvero Studio, 2026 · Next.js, TypeScript, Stripe (tryb testowy) · Nie jest to prawdziwy sklep.</p></div></footer>
      </body>
    </html>
  );
}
