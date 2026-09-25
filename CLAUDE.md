# Centrum Zen Kąciki — kontekst projektu

Strona Centrum Zen Kąciki (Buddyjska Wspólnota Zen Kannon), prowadzona przez Jarka (Jarosław Chybicki).
Komunikacja po polsku. Szczegółowe instrukcje dla użytkownika: `README.md`.

## Fakty (nie zmieniać bez potwierdzenia)
- Adres: ul. Cicha 5, Kąciki, gmina Osieck, powiat otwocki, woj. mazowieckie (NIE Kociewie/Pomorze).
- Kąciki to istniejące Centrum (odbywają się tu sesshin); trwa jego rozbudowa.
- Linia: Shunryu Suzuki Roshi → Jakusho Kwong Roshi (zapoczątkował praktykę w Polsce) → opat Sanghi Kannon: Roshi Mikołaj Uji Markiewicz.
- Numery kont i wydarzenia są na kannon.pl — strona do nich odsyła.

## Architektura
- Eleventy 3 (`src/` → `_site/`), Netlify: projekt **kacikizen** → https://kacikizen.netlify.app, auto-deploy z gałęzi `claude/sweet-dirac-q87xku` (domyślna gałąź repo).
- Osadzana w iframe na podstronie kannon.pl (WordPress). W ramce ukrywa nagłówek/stopkę (`html.osadzona`), wysyła wysokość i przewijanie przez `postMessage` — kod dla admina WP w `README.md`. CSP `frame-ancestors` w `netlify.toml`.
- Panel treści: Pages CMS (`.pages.yml`). Jarek edytuje przez panel → commity „(via Pages CMS)” na tej samej gałęzi. **Zawsze `git pull` przed pracą i przed pushem.**
- Treści: Aktualności `src/aktualnosci/wpisy/*.md` (komunikaty, wieści z budowy — kategorie Komunikaty / Z budowy / Z życia Centrum), Zapiski z Kącików `src/zapiski/wpisy/*.md` (teksty o praktyce zen — Refleksje / Praktyka / Zen w codzienności), dokumenty `src/dokumenty/pliki/*.md`, ustawienia `src/_data/strona.json` (logo, hasło, wstęp, e-mail, etapy „Historia powstawania” z polem rok). Układ/adres wpisów i dokumentów nadaje `src/_data/eleventyComputed.js` — w tych folderach nie trzymać plików technicznych.
- Media: `src/img/uploads` (limit wgrywania w Pages CMS ~kilka MB). Zdjęcia zmniejsza Netlify Image CDN (filtr `foto`; także zdjęcia w treści — filtr `zdjeciaWTresci`).
- Terminy: funkcja `netlify/functions/terminy.mts` → `/api/terminy`, Google Calendar API; zmienne `GOOGLE_CALENDAR_ID`, `GOOGLE_API_KEY` w Netlify.
- Formularz kontaktowy: Netlify Forms (włączone w projekcie kacikizen).

## Styl
Dopasowany do kannon.pl: font Lora, biel, grafit #333, bordo #8e1f2b (linki), czerwień pieczęci #c0392b, ensō jako domyślne logo.
(Własne kolory Jarka #084C61/#177E89/#db3a34 świadomie NIE są tu używane.)

## Sposób pracy
- Każda zmiana: skill `zmiana-na-stronie` (`.claude/skills/`) — pull, zmiana, build, `sprawdz.cjs`, pull, push.
- Wpisy pisane przez Claude'a z notatek Jarka → `szkic: true`; Jarek dodaje zdjęcia i publikuje w panelu.
- Fragmenty nauk nauczycieli w Zapiskach — tylko za ich zgodą.

## Otwarte sprawy (stan na 25.09.2026)
- [ ] Jarek podłącza Kalendarz Google (instrukcja w README).
- [ ] Jarek przemyśli wygląd i zawartość strony.
- [ ] Logo — Jarek może wgrać własne (pole w Ustawieniach strony); ew. zamiana dużego ensō w hero.
- [ ] Dokumenty: pusta zakładka gotowa (Regulaminy / Raporty z posiedzeń zarządu / Sprawozdania / Inne). Oferta: szablon raportu z posiedzenia zarządu; projekt regulaminu pobytu.
- [ ] Skill „wpis z notatek” (ton Zapisków) — czeka na 2–3 teksty Jarka jako wzorzec stylu.
- [ ] Usunąć zbędny pusty projekt Netlify `kaciki-zen` (robi to Jarek w UI).
- [ ] Przekazać adminowi kannon.pl kod osadzenia z README.
