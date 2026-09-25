# Ośrodek Zen Kąciki — strona

Statyczna strona (HTML + CSS + odrobina JS), gotowa do wdrożenia na Netlify.

## Struktura

- `index.html` — strona główna (sekcje: Ośrodek, Praktyka, Budowa, Wsparcie, Dojazd, Kontakt)
- `dziekujemy.html` — strona po wysłaniu formularza
- `styles.css`, `script.js`, `assets/enso.svg`
- `netlify.toml` — konfiguracja wdrożenia

## Do uzupełnienia

W `index.html` oznaczone jako `[do uzupełnienia]` / „termin wkrótce”:

1. Numer konta do darowizn (sekcja *Wsparcie*).
2. Adres e-mail kontaktowy (`mailto:` w sekcji *Kontakt*).
3. Terminy spotkań (lista `.events` w sekcji *Praktyka*).
4. Status etapów budowy — klasy `done` / `current` na elementach `.timeline li`.

## Formularz

Formularz kontaktowy korzysta z Netlify Forms (`data-netlify="true"`) — zgłoszenia pojawią się w panelu Netlify → *Forms*. Warto tam ustawić powiadomienia e-mail.

## Podgląd lokalny

```
python3 -m http.server 8000
```
