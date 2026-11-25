"use client";
import { useActionState, useEffect, useRef } from "react";
import { zamow, type StanZamowienia } from "../actions";

const POLA: Record<string, string> = { imie: "Imię i nazwisko", email: "E-mail", ulica: "Ulica", kod: "Kod pocztowy", miasto: "Miejscowość", regulamin: "Regulamin", koszyk: "Koszyk" };

export function ZamowienieForm({ stripe }: { stripe: boolean }) {
  const [s, akcja, trwa] = useActionState<StanZamowienia, FormData>(zamow, { bledy: {}, wartosci: {} });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (Object.keys(s.bledy).length) ref.current?.focus(); }, [s]);
  const b = s.bledy, w = s.wartosci;
  const pole = (id: string, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="field">
      <label htmlFor={id}>{label} *</label>
      <input id={id} name={id} defaultValue={w[id]} aria-invalid={!!b[id]} aria-describedby={b[id] ? `${id}-err` : undefined} {...extra} />
      {b[id] && <p className="err" id={`${id}-err`}>{b[id]}</p>}
    </div>
  );
  return (
    <form action={akcja} noValidate>
      {Object.keys(b).length > 0 && (
        <div className="error-summary" role="alert" tabIndex={-1} ref={ref}>
          <h3>Popraw dane zamówienia</h3>
          <ul>{Object.entries(b).map(([k, v]) => <li key={k}><a href={`#${k}`}>{POLA[k]}: {v}</a></li>)}</ul>
        </div>
      )}
      {pole("imie", "Imię i nazwisko", { autoComplete: "name" })}
      {pole("email", "E-mail", { type: "email", autoComplete: "email" })}
      {pole("ulica", "Ulica i numer", { autoComplete: "street-address" })}
      {pole("kod", "Kod pocztowy", { autoComplete: "postal-code", inputMode: "numeric" })}
      {pole("miasto", "Miejscowość", { autoComplete: "address-level2" })}
      <fieldset className="field">
        <legend>Metoda płatności</legend>
        <div className="check"><input type="radio" id="m-sym" name="metoda" value="symulacja" defaultChecked={!stripe} /><label htmlFor="m-sym">Symulacja bramki płatności (demo)</label></div>
        <div className="check"><input type="radio" id="m-stripe" name="metoda" value="stripe" defaultChecked={stripe} disabled={!stripe} aria-describedby="stripe-hint" /><label htmlFor="m-stripe">Karta / BLIK / Przelewy24 – Stripe, tryb testowy</label></div>
        <p className="hint" id="stripe-hint">{stripe ? "Użyj testowej karty 4242 4242 4242 4242 – żadne pieniądze nie zostaną pobrane." : "Stripe nieskonfigurowany w tym wdrożeniu – dostępna jest symulacja."}</p>
      </fieldset>
      <div className="field check"><input type="checkbox" id="regulamin" name="regulamin" aria-invalid={!!b.regulamin} aria-describedby={b.regulamin ? "regulamin-err" : undefined} /><label htmlFor="regulamin">Akceptuję <a href="/regulamin">regulamin sklepu demo</a>. *</label></div>
      {b.regulamin && <p className="err" id="regulamin-err">{b.regulamin}</p>}
      <button className="btn" type="submit" disabled={trwa}>{trwa ? "Przetwarzanie…" : "Zamawiam i płacę (test)"}</button>
    </form>
  );
}
