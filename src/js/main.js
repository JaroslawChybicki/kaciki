(function () {
  var osadzona = window.self !== window.top;

  /* ---------- Osadzenie w kannon.pl: wysokość ramki i przewijanie ---------- */
  function doRodzica(msg) {
    if (osadzona) window.parent.postMessage(msg, '*');
  }
  if (osadzona) {
    var wyslijWysokosc = function () {
      doRodzica({ type: 'kaciki-wysokosc', height: document.documentElement.scrollHeight });
    };
    new ResizeObserver(wyslijWysokosc).observe(document.body);
    window.addEventListener('load', wyslijWysokosc);
    doRodzica({ type: 'kaciki-strona' });

    // W ramce bez własnego paska przewijania kotwice musi obsłużyć strona nadrzędna.
    var przewinDo = function (id) {
      var el = document.getElementById(id);
      if (el) doRodzica({ type: 'kaciki-przewin', top: el.getBoundingClientRect().top + window.scrollY });
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a) return;
      var url = new URL(a.href);
      if (url.pathname === location.pathname && url.hash) {
        e.preventDefault();
        przewinDo(url.hash.slice(1));
      }
    });
    if (location.hash) window.addEventListener('load', function () { przewinDo(location.hash.slice(1)); });
  }

  /* ---------- Menu na telefonie (hamburger) ---------- */
  var menu = document.querySelector('.menu');
  var przycisk = document.querySelector('.menu-przycisk');
  if (menu && przycisk) {
    var ustaw = function (otwarte) {
      menu.classList.toggle('otwarte', otwarte);
      przycisk.setAttribute('aria-expanded', otwarte);
    };
    przycisk.addEventListener('click', function () { ustaw(!menu.classList.contains('otwarte')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('.menu-in a')) ustaw(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ustaw(false); });
  }

  /* ---------- Terminy z Kalendarza Google (wspólne z /terminy/) ---------- */
  var STREFA = 'Europe/Warsaw';
  var fMiesiac = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', timeZone: STREFA });
  var fPelna = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: STREFA });
  var fGodzina = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: STREFA });
  var fKlucz = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: STREFA });

  // Dni jako klucze „RRRR-MM-DD” w strefie Warszawy; arytmetyka na UTC, żeby nie zależeć od strefy przeglądarki.
  var naDate = function (k) { var p = k.split('-'); return new Date(Date.UTC(+p[0], p[1] - 1, +p[2], 12)); };
  var naKlucz = function (d) { return d.toISOString().slice(0, 10); };
  var dodajDni = function (k, n) { var d = naDate(k); d.setUTCDate(d.getUTCDate() + n); return naKlucz(d); };
  var kluczCzasu = function (iso) { return fKlucz.format(new Date(iso)); };

  // Pierwszy i ostatni dzień wydarzenia (koniec całodniowych w Google jest wyłączny).
  var dni = function (t) {
    if (t.calodniowe) return { od: t.start, do: dodajDni(t.koniec, -1) };
    var koniec = new Date(new Date(t.koniec).getTime() - 1);
    return { od: kluczCzasu(t.start), do: t.koniec ? fKlucz.format(koniec) : kluczCzasu(t.start) };
  };

  var zakres = function (t) {
    if (!t.calodniowe) return fPelna.format(new Date(t.start)) + ', ' + fGodzina.format(new Date(t.start));
    var r = dni(t), a = naDate(r.od), b = naDate(r.do);
    if (r.od === r.do) return fPelna.format(a);
    if (r.od.slice(0, 7) === r.do.slice(0, 7)) return a.getUTCDate() + '–' + fPelna.format(b);
    return (r.od.slice(0, 4) === r.do.slice(0, 4) ? fMiesiac.format(a) : fPelna.format(a)) + ' – ' + fPelna.format(b);
  };

  var esc = function (s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  var termin = function (t) {
    return '<li class="termin"><span class="termin-data">' + esc(zakres(t)) + '</span>' +
      '<span><span class="termin-tytul">' + esc(t.tytul) + '</span>' +
      (t.miejsce ? '<span class="termin-miejsce">' + esc(t.miejsce) + '</span>' : '') + '</span></li>';
  };
  var pobierz = function (parametry) {
    return fetch('/api/terminy' + (parametry ? '?' + new URLSearchParams(parametry) : ''))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  };
  var KANNON = '<a class="link" href="https://www.kannon.pl/" target="_top">kannon.pl</a>';

  window.KacikiTerminy = {
    dni: dni, zakres: zakres, termin: termin, esc: esc, pobierz: pobierz,
    naDate: naDate, naKlucz: naKlucz, dodajDni: dodajDni, dzis: function () { return fKlucz.format(new Date()); },
    KANNON: KANNON,
  };

  var lista = document.querySelector('[data-terminy]');
  if (lista) {
    var info = function (html) { lista.innerHTML = '<li class="terminy-info">' + html + '</li>'; };
    pobierz({ max: 5 })
      .then(function (d) {
        if (!d.terminy || !d.terminy.length) {
          info(d.skonfigurowany === false
            ? 'Kalendarz wkrótce. Aktualne wydarzenia znajdziesz na ' + KANNON + '.'
            : 'Brak zaplanowanych terminów. Zajrzyj wkrótce lub napisz do nas.');
          return;
        }
        lista.innerHTML = d.terminy.map(termin).join('');
      })
      .catch(function () { info('Nie udało się wczytać terminów. Aktualne wydarzenia znajdziesz na ' + KANNON + '.'); });
  }

  /* ---------- Powiększanie zdjęć z galerii ---------- */
  var dlg = document.querySelector('.lightbox');
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-lightbox]');
    if (!a || !dlg || !dlg.showModal) return;
    e.preventDefault();
    dlg.querySelector('img').src = a.href;
    dlg.querySelector('img').alt = a.dataset.podpis || '';
    dlg.querySelector('.lightbox-podpis').textContent = a.dataset.podpis || '';
    dlg.showModal();
  });
  if (dlg) dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
})();
