# DEMO: sklep internetowy z płatnościami w trybie testowym – Next.js + Stripe

> **Projekt pokazowy (portfolio) Isvero Studio, listopad 2026 r.** Nie jest to prawdziwy sklep ani realizacja dla klienta. Produkty i ceny są fikcyjne, a płatności działają **wyłącznie w trybie testowym** – nic nie jest sprzedawane ani obciążane.

**Demo na żywo:** https://demo-sklep.isverostudio.com (noindex)

## Co pokazuje
- katalog produktów, karta produktu, stany magazynowe (produkt niedostępny),
- koszyk w ciasteczku `HttpOnly` (Server Actions, działa bez JavaScriptu): dodawanie, zmiana ilości, usuwanie, limity ilości,
- podsumowanie: netto, **VAT według stawek 23/8/5%** (liczony od brutto per linia), dostawa i darmowa dostawa od 150 zł,
- zamówienie z walidacją po stronie serwera i dostępnym podsumowaniem błędów (fokus, `aria-invalid`),
- **płatności**: Stripe Checkout w trybie testowym (karta, BLIK, Przelewy24) albo wbudowana symulacja bramki; **webhook** z weryfikacją podpisu HMAC (`Stripe-Signature`, tolerancja czasu), kontrolą kwoty i idempotentną zmianą statusu,
- klucze produkcyjne są odrzucane (akceptowany tylko `sk_test_…`), zamówienia przechowywane bez adresu, maks. 500 ostatnich.

## Jakość
- TypeScript `strict`, 6 testów jednostkowych (`npm test`): VAT, dostawa, normalizacja koszyka, kodowanie cookie, podpis webhooka,
- test E2E w Playwright + axe-core (`npm run test:e2e`): pełny scenariusz zakupu na 1280 i 320 px, **0 naruszeń WCAG 2.1 A/AA**, brak przewijania w poziomie, webhook bez podpisu → 400,
- `npm audit --omit=dev`: 0 podatności.

## Konfiguracja płatności testowych (opcjonalnie)
1. Konto Stripe w trybie testowym → klucz `sk_test_…` jako `STRIPE_SECRET_KEY`.
2. Webhook na `https://<domena>/api/stripe/webhook` (zdarzenia `checkout.session.completed`, `checkout.session.expired`) → `STRIPE_WEBHOOK_SECRET`.
3. Karta testowa: 4242 4242 4242 4242, dowolna przyszła data i CVC.

## Uruchomienie
```bash
npm ci && npm run dev
docker compose up --build
```
