# Centrum Zen Kąciki — strona

Strona Centrum Zen w Kącikach (Sangha Kannon), osadzana w ramce na kannon.pl.
Zbudowana w [Eleventy](https://www.11ty.dev/), hostowana na Netlify, edytowana w [Pages CMS](https://app.pagescms.org).

## Edycja treści (bez kodu)

1. Wejdź na **https://app.pagescms.org** i zaloguj się kontem GitHub.
2. Wybierz repozytorium `JaroslawChybicki/kaciki`.
3. **Zapiski z Kącików** → *Add an entry*: tytuł, data, kategoria, zajawka, zdjęcie główne, galeria, treść.
   Zaznacz *Szkic*, jeśli wpis nie jest jeszcze gotowy.
4. **Ustawienia strony** — hasło, wstęp, adres, e-mail i etapy rozbudowy (status: zakończony / w toku / planowany).
5. Po zapisaniu Netlify przebuduje stronę — zmiany są widoczne po 1–2 minutach.

Zdjęcia: wgrywaj zwykłe JPG z telefonu/aparatu (najlepiej do ~5 MB). Netlify samo je zmniejsza i konwertuje do WebP.

## Terminy z Kalendarza Google

Sekcja „Najbliższa praktyka” pobiera wydarzenia z publicznego kalendarza Google.

1. W Google Calendar: utwórz kalendarz „Centrum Zen Kąciki” → *Ustawienia* → *Uprawnienia dostępu* → **Udostępnij publicznie**.
   W *Integracja kalendarza* skopiuj **Identyfikator kalendarza**.
2. W [Google Cloud Console](https://console.cloud.google.com/): włącz *Google Calendar API* i utwórz **klucz API**
   (ogranicz go do *Google Calendar API*).
3. W Netlify: *Project configuration → Environment variables* dodaj `GOOGLE_CALENDAR_ID` i `GOOGLE_API_KEY`, potem *Trigger deploy*.

Klucz działa tylko po stronie serwera (funkcja `netlify/functions/terminy.mts`) — nie trafia do przeglądarki.
Lista odświeża się co ok. 5 minut. Pokazywane są: tytuł, *Lokalizacja* oraz pole *Opis* według wzoru
(każda linia opcjonalna; wydarzenie z opisem rozwija się na stronie po kliknięciu):

```
Prowadzi: Roshi Mikołaj Uji Markiewicz   ← także „Prowadzący:” lub „Prowadzenie:”
Zapisy: osrodek@kannon.pl        ← albo link https://…

Plan dnia:
5:00 Zazen
7:00 Śniadanie ōryōki
9:00–12:00 Samu

Dowolny opis wydarzenia — koszt, co zabrać, warunki uczestnictwa.
```

„Plan dnia” kończy się pustą linią; tekst poza polami jest opisem.

Załączniki dodane do wydarzenia (pliki z Google Drive) pokazują się jako „Pliki” — plik musi być
udostępniony w Drive jako **„Każda osoba mająca link”**, inaczej odwiedzający zobaczą prośbę o dostęp.

## Osadzenie na kannon.pl (dla administratora WordPressa)

Na podstronie wstaw blok **Własny HTML** z kodem:

```html
<iframe id="kaciki-zen" src="https://kacikizen.netlify.app/" title="Centrum Zen Kąciki"
        style="width:100%;border:0;min-height:900px;display:block" loading="lazy"></iframe>
<script>
(function () {
  var f = document.getElementById('kaciki-zen'), pierwsza = true;
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://kacikizen.netlify.app' || !e.data) return;
    var d = e.data;
    if (d.type === 'kaciki-wysokosc') f.style.height = d.height + 'px';
    if (d.type === 'kaciki-strona') { if (!pierwsza) f.scrollIntoView(); pierwsza = false; }
    if (d.type === 'kaciki-przewin') window.scrollTo({ top: f.getBoundingClientRect().top + window.scrollY + d.top - 20, behavior: 'smooth' });
  });
})();
</script>
```

Skrypt dopasowuje wysokość ramki do treści (bez podwójnego paska przewijania) i obsługuje przewijanie
do sekcji oraz przejścia między podstronami. W ramce strona automatycznie ukrywa własny nagłówek i stopkę.
Nagłówek `frame-ancestors` w `netlify.toml` pozwala osadzać stronę tylko na kannon.pl.

## Netlify — pierwsze podłączenie

Projekt `kacikizen` → *Project configuration → Build & deploy → Link repository* → GitHub → `JaroslawChybicki/kaciki`,
gałąź `claude/sweet-dirac-q87xku`. Ustawienia budowania są w `netlify.toml`.

## Praca lokalna

```
npm install
npm start        # podgląd na http://localhost:8080
```
