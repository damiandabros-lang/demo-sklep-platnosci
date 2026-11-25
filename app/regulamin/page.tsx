import type { Metadata } from "next";
export const metadata: Metadata = { title: "Regulamin (demo)" };
export default function Regulamin() {
  return (
    <>
      <h1>Regulamin sklepu demonstracyjnego</h1>
      <ol>
        <li>Sklep Przykładowo jest wersją demonstracyjną przygotowaną przez Isvero Studio. Nie prowadzi sprzedaży.</li>
        <li>Produkty, ceny i stany magazynowe są fikcyjne.</li>
        <li>Płatności działają wyłącznie w trybie testowym (Stripe test mode lub symulacja). Nie podawaj prawdziwych danych karty.</li>
        <li>Zamówienia demonstracyjne przechowujemy bez adresu dostawy (imię, miejscowość, e-mail, pozycje) i usuwamy automatycznie – zachowujemy najwyżej 500 ostatnich.</li>
        <li>W prawdziwym wdrożeniu tutaj znajdą się: dane sprzedawcy, prawo odstąpienia od umowy (14 dni), reklamacje, informacja RODO i pliki cookie.</li>
      </ol>
    </>
  );
}
