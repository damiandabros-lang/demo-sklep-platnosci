import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { podsumuj, normalizuj, nettoZBrutto, zakoduj, odkoduj, DOSTAWA_GR } from "../../lib/koszyk.ts";
import { weryfikujPodpis } from "../../lib/stripe.ts";

test("netto z brutto dla stawek 23/8/5", () => {
  assert.equal(nettoZBrutto(3900, 23), 3171);
  assert.equal(nettoZBrutto(3200, 8), 2963);
  assert.equal(nettoZBrutto(4990, 5), 4752);
});
test("podsumowanie: VAT wg stawek, dostawa płatna poniżej 150 zł", () => {
  const s = podsumuj([{ slug: "kubek-ceramiczny", ilosc: 2 }, { slug: "przewodnik", ilosc: 1 }]);
  assert.equal(s.bruttoGr, 2 * 3900 + 4990);
  assert.equal(s.nettoGr + s.vatGr, s.bruttoGr);
  assert.deepEqual(Object.keys(s.vatWgStawek).sort(), ["23%", "5%"]);
  assert.equal(s.dostawaGr, DOSTAWA_GR);
  assert.equal(s.doZaplatyGr, s.bruttoGr + DOSTAWA_GR);
});
test("darmowa dostawa od 150 zł", () => assert.equal(podsumuj([{ slug: "torba-lniana", ilosc: 1 }, { slug: "przewodnik", ilosc: 4 }]).dostawaGr, 0));
test("koszyk odrzuca nieznane i niedostępne produkty, limituje ilość", () => {
  assert.deepEqual(normalizuj([{ slug: "xxx", ilosc: 1 }, { slug: "torba-lniana", ilosc: 1 }, { slug: "notes-a5", ilosc: 50 }]), [{ slug: "notes-a5", ilosc: 10 }]);
  assert.deepEqual(normalizuj([{ slug: "notes-a5", ilosc: -3 }]), []);
});
test("kodowanie koszyka w cookie jest odwracalne", () => {
  const k = [{ slug: "notes-a5", ilosc: 2 }, { slug: "kubek-ceramiczny", ilosc: 1 }];
  assert.deepEqual(odkoduj(zakoduj(k)), k);
  assert.deepEqual(odkoduj("smieci,,:"), []);
});
test("podpis webhooka Stripe: poprawny, zły, przeterminowany", () => {
  const sekret = "whsec_test_demo", payload = '{"type":"x"}', t = 1764072000;
  const v1 = createHmac("sha256", sekret).update(`${t}.${payload}`).digest("hex");
  assert.equal(weryfikujPodpis(payload, `t=${t},v1=${v1}`, sekret, t + 10), true);
  assert.equal(weryfikujPodpis(payload + " ", `t=${t},v1=${v1}`, sekret, t + 10), false);
  assert.equal(weryfikujPodpis(payload, `t=${t},v1=${v1}`, sekret, t + 3600), false);
  assert.equal(weryfikujPodpis(payload, null, sekret), false);
});
