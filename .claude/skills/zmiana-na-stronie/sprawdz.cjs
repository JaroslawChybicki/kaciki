// Kontrola zbudowanej strony (_site) przed publikacją.
// Użycie: NODE_PATH=$(npm root -g) node .claude/skills/zmiana-na-stronie/sprawdz.cjs <katalog-na-zrzuty>
// Sprawdza: odpowiedzi 200, błędy JS, poziome przewijanie (desktop 1280 i telefon 390),
// osadzenie w ramce jak na kannon.pl (wysokość, ukryty nagłówek). Kod wyjścia 1 = są problemy.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const SITE = path.resolve("_site");
const ZRZUTY = path.resolve(process.argv[2] || ".");
const TYPY = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };

const RAMKA = `<!doctype html><meta charset="utf-8"><body style="margin:0">
<div style="height:300px;background:#eee">[kannon.pl]</div>
<iframe id="kaciki-zen" src="/" style="width:100%;border:0;min-height:600px;display:block"></iframe>
<script>addEventListener('message',function(e){var f=document.getElementById('kaciki-zen');
if(e.data&&e.data.type==='kaciki-wysokosc')f.style.height=e.data.height+'px';});</script>`;

// Testowe wydarzenia względem dzisiejszej daty (widoki Miesiąc/Rok mają co pokazać).
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const TERMINY = { skonfigurowany: true, terminy: [
  { id: "t1", tytul: "Sesshin testowe", miejsce: "Kąciki", calodniowe: true, start: d(3), koniec: d(10),
    prowadzi: "Nauczyciel testowy", opis: "Opis testowy.\n\nDrugi akapit.", zapisy: "osrodek@kannon.pl",
    plan: [{ godz: "5:00", co: "Zazen" }, { godz: "7:00", co: "Śniadanie" }] },
  { tytul: "Wprowadzenie do zazen", calodniowe: false, start: d(14) + "T18:00:00+02:00", koniec: d(14) + "T20:00:00+02:00" },
  { tytul: "Weekend samu", miejsce: "Kąciki", calodniowe: true, start: d(40), koniec: d(42) },
] };

function serwer() {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__ramka.html") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(RAMKA); }
    let plik = path.join(SITE, url);
    if (fs.existsSync(plik) && fs.statSync(plik).isDirectory()) plik = path.join(plik, "index.html");
    if (!plik.startsWith(SITE) || !fs.existsSync(plik)) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "content-type": TYPY[path.extname(plik)] || "application/octet-stream" });
    fs.createReadStream(plik).pipe(res);
  });
}

// Wszystkie strony z _site (bez stron technicznych).
function strony(dir = SITE, baza = "/") {
  const wynik = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !["css", "js", "img"].includes(e.name)) wynik.push(...strony(path.join(dir, e.name), baza + e.name + "/"));
    if (e.name === "index.html") wynik.push(baza);
  }
  return wynik;
}

(async () => {
  if (!fs.existsSync(SITE)) { console.error("Brak _site — najpierw zbuduj stronę (npx eleventy)."); process.exit(1); }
  fs.mkdirSync(ZRZUTY, { recursive: true });
  const srv = serwer().listen(0);
  const baza = `http://localhost:${srv.address().port}`;
  const przegladarka = await chromium.launch();
  const problemy = [];

  for (const [nazwa, szer] of [["desktop", 1280], ["telefon", 390]]) {
    const ctx = await przegladarka.newContext({ viewport: { width: szer, height: 800 } });
    await ctx.route("**/api/terminy*", (r) => r.fulfill({ json: TERMINY }));
    await ctx.route("**/.netlify/images**", (r) => r.fulfill({ status: 404 }));
    for (const url of strony()) {
      const p = await ctx.newPage();
      p.on("pageerror", (e) => problemy.push(`${nazwa} ${url}: błąd JS: ${e.message}`));
      const odp = await p.goto(baza + url, { waitUntil: "networkidle" }).catch((e) => ({ status: () => e.message }));
      if (odp.status() !== 200) problemy.push(`${nazwa} ${url}: status ${odp.status()}`);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      if (sw > szer) problemy.push(`${nazwa} ${url}: poziome przewijanie (${sw}px > ${szer}px)`);
      const plik = `${nazwa}${url.replace(/\//g, "_")}.png`.replace(/_\.png$/, ".png");
      await p.screenshot({ path: path.join(ZRZUTY, plik), fullPage: true });
      await p.close();
    }
    await ctx.close();
  }

  const ctx = await przegladarka.newContext({ viewport: { width: 1100, height: 800 } });
  await ctx.route("**/api/terminy*", (r) => r.fulfill({ json: TERMINY }));
  const p = await ctx.newPage();
  await p.goto(baza + "/__ramka.html", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const wys = parseInt(await p.evaluate(() => document.getElementById("kaciki-zen").style.height)) || 0;
  const naglowek = await p.frames()[1].evaluate(() => getComputedStyle(document.querySelector(".naglowek")).display);
  if (wys < 1000) problemy.push(`ramka: wysokość nie dopasowała się (${wys}px)`);
  if (naglowek !== "none") problemy.push("ramka: nagłówek strony nie jest ukryty");
  await p.screenshot({ path: path.join(ZRZUTY, "ramka.png") });

  await przegladarka.close();
  srv.close();
  console.log(`Sprawdzono ${strony().length} stron × 2 szerokości + ramkę. Zrzuty: ${ZRZUTY}`);
  if (problemy.length) { console.log("PROBLEMY:\n- " + problemy.join("\n- ")); process.exit(1); }
  console.log("OK — brak problemów.");
})();
