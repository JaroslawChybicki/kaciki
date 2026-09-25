import type { Config } from "@netlify/functions";

// Najbliższe wydarzenia z publicznego Kalendarza Google Centrum.
// Wymaga zmiennych środowiskowych w Netlify: GOOGLE_CALENDAR_ID i GOOGLE_API_KEY.
// Parametry (opcjonalne): ?od=RRRR-MM-DD&do=RRRR-MM-DD&max=N — bez nich: najbliższe wydarzenia od teraz.
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const DZIEN = 86_400_000;

function zakresZapytania(url: URL) {
  const od = url.searchParams.get("od");
  const doDnia = url.searchParams.get("do");
  const max = Math.min(Math.max(parseInt(url.searchParams.get("max") ?? "", 10) || 8, 1), 250);
  // Dzień zapasu z obu stron — przeglądarka i tak dopasowuje wydarzenia do dni w strefie Europe/Warsaw.
  const min = od && DATA.test(od) ? new Date(Date.parse(od) - DZIEN) : new Date();
  let maxCzas = doDnia && DATA.test(doDnia) ? new Date(Date.parse(doDnia) + 2 * DZIEN) : undefined;
  if (maxCzas && maxCzas.getTime() - min.getTime() > 400 * DZIEN) maxCzas = new Date(min.getTime() + 400 * DZIEN);
  return { min, maxCzas, max };
}

// Opis wydarzenia z Google Calendar → pola strony. Wzór (każda linia opcjonalna):
//   Prowadzi: Roshi Mikołaj Uji Markiewicz
//   Zapisy: https://… albo adres e-mail
//   Plan dnia:
//   5:00 Zazen
//   7:00 Śniadanie ōryōki
//   (pusta linia kończy plan)
//   Pozostały tekst to opis.
function tekst(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

const GODZINA = /^(\d{1,2}[:.]\d{2}(?:\s*[–-]\s*\d{1,2}[:.]\d{2})?)\s*[–—-]?\s*(.*)$/;

function rozbierzOpis(surowy: string) {
  const wynik = { prowadzi: "", zapisy: "", plan: [] as { godz: string; co: string }[], opis: "" };
  const reszta: string[] = [];
  let wPlanie = false;
  for (const linia of tekst(surowy ?? "").split("\n").map((l) => l.trim())) {
    const pole = /^(prowadz(?:i|ący|ąca|ą)|zapisy|plan dnia)\s*:\s*(.*)$/i.exec(linia);
    if (pole) {
      const nazwa = pole[1].toLowerCase();
      wPlanie = nazwa === "plan dnia";
      if (nazwa.startsWith("prowadz")) wynik.prowadzi = pole[2];
      else if (nazwa === "zapisy") wynik.zapisy = pole[2];
      continue;
    }
    if (wPlanie) {
      if (!linia) { wPlanie = false; continue; }
      const g = GODZINA.exec(linia);
      wynik.plan.push(g ? { godz: g[1].replace(".", ":"), co: g[2] } : { godz: "", co: linia });
      continue;
    }
    reszta.push(linia);
  }
  wynik.opis = reszta.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return wynik;
}

export default async (req: Request) => {
  const calendarId = Netlify.env.get("GOOGLE_CALENDAR_ID");
  const apiKey = Netlify.env.get("GOOGLE_API_KEY");

  if (!calendarId || !apiKey) {
    return Response.json({ skonfigurowany: false, terminy: [] });
  }

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  const { min, maxCzas, max } = zakresZapytania(new URL(req.url));
  const parametry = new URLSearchParams({
    key: apiKey,
    timeMin: min.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: String(max),
    timeZone: "Europe/Warsaw",
  });
  if (maxCzas) parametry.set("timeMax", maxCzas.toISOString());
  url.search = parametry.toString();

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Google Calendar API:", res.status, await res.text());
    return Response.json({ blad: true, terminy: [] }, { status: 502 });
  }

  const dane = await res.json();
  const terminy = (dane.items ?? []).map((e: any) => ({
    id: e.id ?? "",
    tytul: e.summary ?? "",
    ...rozbierzOpis(e.description ?? ""),
    miejsce: e.location ?? "",
    calodniowe: Boolean(e.start?.date),
    start: e.start?.date ?? e.start?.dateTime,
    koniec: e.end?.date ?? e.end?.dateTime,
  }));

  return Response.json(
    { skonfigurowany: true, terminy },
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
};

export const config: Config = {
  path: "/api/terminy",
};
