// E2E + axe-core: dodanie do koszyka, błędy formularza, zamówienie, symulowana płatność, webhook bez podpisu.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.argv[2] || "http://127.0.0.1:3000";
let fails = 0;
const fail = (m) => { fails++; console.log("FAIL", m); };
async function check(pg, label) {
  await pg.waitForFunction(() => document.title.length > 0, null, { timeout: 5000 }).catch(() => {});
  await pg.addScriptTag({ content: axe });
  const r = await pg.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }));
  const over = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (r.violations.length || over) fail(`${label} ${over ? "H-SCROLL " : ""}${r.violations.map((v) => v.id + ":" + v.nodes[0].target).join(" ")}`);
}
const b = await chromium.launch();
for (const vp of [{ width: 1280, height: 900 }, { width: 320, height: 640 }]) {
  const ctx = await b.newContext({ viewport: vp }); const pg = await ctx.newPage(); const L = vp.width;
  for (const p of ["/", "/produkt/kubek-ceramiczny", "/regulamin", "/koszyk", "/nie-ma"]) { await pg.goto(BASE + p); await check(pg, `${L} ${p}`); }
  await pg.goto(BASE + "/produkt/notes-a5"); await pg.fill("#ilosc", "3"); await pg.click("form button[type=submit]");
  await pg.waitForURL(/koszyk/); await check(pg, `${L} koszyk pełny`);
  if (!(await pg.textContent("main")).includes("Notes A5")) fail("produkt nie trafił do koszyka");
  await pg.click("form[action] button.btn[type=submit] >> text=Zamawiam");
  await pg.waitForSelector(".error-summary");
  if ((await pg.evaluate(() => document.activeElement?.className)) !== "error-summary") fail("fokus nie na podsumowaniu błędów");
  await check(pg, `${L} koszyk błędy`);
  await pg.fill("#imie", "Jan Przykładowy"); await pg.fill("#email", "jan@example.org"); await pg.fill("#ulica", "Przykładowa 1");
  await pg.fill("#kod", "00-001"); await pg.fill("#miasto", "Przykładowo"); await pg.check("#regulamin");
  await pg.click("text=Zamawiam");
  await pg.waitForURL(/zamowienie\//); await check(pg, `${L} zamówienie`);
  await pg.click("text=Zapłać (sukces)"); await pg.waitForSelector("text=Opłacone");
  await check(pg, `${L} opłacone`);
  await ctx.close();
}
const r = await fetch(BASE + "/api/stripe/webhook", { method: "POST", body: "{}" });
if (r.status !== 400) fail("webhook bez podpisu powinien zwrócić 400, jest " + r.status);
await b.close();
console.log(fails ? `BŁĘDY: ${fails}` : "OK: 0 naruszeń, scenariusz zakupu działa");
process.exit(fails ? 1 : 0);
