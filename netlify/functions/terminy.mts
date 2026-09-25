import type { Config } from "@netlify/functions";

// Najbliższe wydarzenia z publicznego Kalendarza Google Centrum.
// Wymaga zmiennych środowiskowych w Netlify: GOOGLE_CALENDAR_ID i GOOGLE_API_KEY.
export default async () => {
  const calendarId = Netlify.env.get("GOOGLE_CALENDAR_ID");
  const apiKey = Netlify.env.get("GOOGLE_API_KEY");

  if (!calendarId || !apiKey) {
    return Response.json({ skonfigurowany: false, terminy: [] });
  }

  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
  url.search = new URLSearchParams({
    key: apiKey,
    timeMin: new Date().toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "8",
    timeZone: "Europe/Warsaw",
  }).toString();

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Google Calendar API:", res.status, await res.text());
    return Response.json({ blad: true, terminy: [] }, { status: 502 });
  }

  const dane = await res.json();
  const terminy = (dane.items ?? []).map((e: any) => ({
    tytul: e.summary ?? "",
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
