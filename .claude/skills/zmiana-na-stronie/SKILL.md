---
name: zmiana-na-stronie
description: Bezpieczny tryb wprowadzania zmian na stronie Centrum Zen Kąciki (kod, wygląd, treści, konfiguracja panelu). Używaj przy KAŻDEJ zmianie w tym repozytorium, także przy dodawaniu wpisu lub dokumentu w imieniu Jarka — pobiera zmiany z Pages CMS, buduje, sprawdza stronę na komputerze, telefonie i w ramce kannon.pl, dopiero potem publikuje.
---

# Zmiana na stronie Kącików

Strona jest edytowana w dwóch miejscach naraz: Jarek w Pages CMS (commity „via Pages CMS”), Claude w kodzie.
Każdy push na gałąź `claude/sweet-dirac-q87xku` od razu publikuje się na https://kacikizen.netlify.app
i w ramce na kannon.pl. Dlatego zawsze ta sama kolejność — bez skrótów.

## 1. Przygotowanie
```bash
git pull --no-rebase origin claude/sweet-dirac-q87xku
npm ci   # tylko gdy brak node_modules albo zmienił się package-lock.json
```
Przeczytaj `CLAUDE.md` (fakty, architektura, otwarte sprawy). Faktów (adres, linia nauczycieli, opat)
nie zmieniaj bez potwierdzenia Jarka.

## 2. Zmiana — zasady
- **Treści Jarka są nietykalne.** Pliki w `src/aktualnosci/wpisy`, `src/zapiski/wpisy`, `src/dokumenty/pliki`,
  `src/_data/strona.json` i `src/img/uploads` zmieniaj tylko, gdy prośba tego dotyczy.
- **Nowy wpis/dokument od Claude'a** zapisuj jako `szkic: true` — publikuje Jarek w panelu (np. po dodaniu zdjęć).
  Nazwa pliku: `RRRR-MM-DD-slug.md`; pola front matter zgodne z `.pages.yml`.
- **Panel i kod muszą się zgadzać.** Nowe/zmienione pole w `strona.json` lub front matter → od razu to samo w `.pages.yml`.
  Nie zmieniaj nazw istniejących pól (`name`) — zniknęłyby dane wpisane w panelu. Po zmianie `.pages.yml`
  przypomnij Jarkowi o przeładowaniu panelu.
- **Zmiana adresu strony** (przeniesienie, zmiana nazwy pliku) → przekierowanie 301 w `netlify.toml`.
- **Ramka kannon.pl:** nie ruszaj mechanizmu `postMessage` w `src/js/main.js` bez aktualizacji kodu osadzenia
  w `README.md` i ostrzeżenia, że admin kannon.pl musi podmienić kod.
- Styl: kolory i font z `CLAUDE.md` (kannon.pl), nie kolory marki osobistej Jarka.

## 3. Kontrola (obowiązkowa)
```bash
rm -rf _site && npx eleventy
NODE_PATH=$(npm root -g) node .claude/skills/zmiana-na-stronie/sprawdz.cjs <scratchpad>/zrzuty
```
Skrypt sprawdza wszystkie strony (desktop 1280 px i telefon 390 px): status 200, błędy JS, poziome
przewijanie, oraz osadzenie w ramce (dopasowanie wysokości, ukryty nagłówek). Terminy kalendarza są podstawiane
testowo. Kod wyjścia 1 = napraw przed publikacją.

Obejrzyj zrzuty zmienionych stron (Read na PNG). Do testów możesz dodać tymczasowy wpis/zdjęcie —
**usuń je przed commitem** i zbuduj ponownie.

## 4. Publikacja
```bash
git status --short                      # tylko zamierzone pliki; bez testowych treści
git add -A && git commit -m "…"         # opis po polsku, co i dlaczego
git pull --no-rebase origin claude/sweet-dirac-q87xku   # Jarek mógł w tym czasie coś zapisać
npx eleventy --quiet                    # po scaleniu nadal się buduje?
git push -u origin claude/sweet-dirac-q87xku
```
Jeśli dostępne są narzędzia Netlify (MCP), sprawdź, że najnowsze wdrożenie projektu `kacikizen`
ma stan `ready`. Jeśli nie — powiedz Jarkowi, że publikacja zajmie 1–2 minuty i nie była weryfikowana.

## 5. Raport dla Jarka
Krótko, po polsku: co się zmieniło na stronie (nie w kodzie), co sprawdzone, co wymaga jego ruchu
(przeładowanie panelu, publikacja szkicu, przekazanie kodu adminowi kannon.pl). Zaktualizuj
„Otwarte sprawy” w `CLAUDE.md`, jeśli coś się zamknęło lub doszło.
