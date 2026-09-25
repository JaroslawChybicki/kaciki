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

  /* ---------- Terminy z Kalendarza Google ---------- */
  var lista = document.querySelector('[data-terminy]');
  if (lista) {
    var miesiac = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', timeZone: 'Europe/Warsaw' });
    var pelna = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' });
    var godzina = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });

    var dzien = function (s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2], 12); };

    var zakres = function (t) {
      if (!t.calodniowe) return pelna.format(new Date(t.start)) + ', ' + godzina.format(new Date(t.start));
      var a = dzien(t.start);
      var b = dzien(t.koniec); b.setDate(b.getDate() - 1); // koniec w Google jest wyłączny
      if (a.toDateString() === b.toDateString()) return pelna.format(a);
      if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return a.getDate() + '–' + pelna.format(b);
      return (a.getFullYear() === b.getFullYear() ? miesiac.format(a) : pelna.format(a)) + ' – ' + pelna.format(b);
    };

    var info = function (html) { lista.innerHTML = '<li class="terminy-info">' + html + '</li>'; };
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
    var kannon = '<a class="link" href="https://www.kannon.pl/" target="_top">kannon.pl</a>';

    fetch('/api/terminy')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        if (!d.terminy || !d.terminy.length) {
          info(d.skonfigurowany === false
            ? 'Kalendarz wkrótce. Aktualne wydarzenia znajdziesz na ' + kannon + '.'
            : 'Brak zaplanowanych terminów. Zajrzyj wkrótce lub napisz do nas.');
          return;
        }
        lista.innerHTML = d.terminy.map(function (t) {
          return '<li class="termin"><span class="termin-data">' + esc(zakres(t)) + '</span>' +
            '<span><span class="termin-tytul">' + esc(t.tytul) + '</span>' +
            (t.miejsce ? '<span class="termin-miejsce">' + esc(t.miejsce) + '</span>' : '') + '</span></li>';
        }).join('');
      })
      .catch(function () { info('Nie udało się wczytać terminów. Aktualne wydarzenia znajdziesz na ' + kannon + '.'); });
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
