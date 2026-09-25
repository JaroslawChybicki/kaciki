// Pełny kalendarz na /terminy/: widoki Lista (12 miesięcy), Miesiąc i Rok.
(function () {
  var K = window.KacikiTerminy;
  var el = document.querySelector('[data-kalendarz]');
  if (!K || !el) return;

  var etykieta = document.querySelector('[data-kal-etykieta]');
  var nawigacja = document.querySelector('[data-kal-nawigacja]');
  var zakladki = document.querySelectorAll('[data-widok]');

  var fMiesiacRok = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  var fMiesiac = new Intl.DateTimeFormat('pl-PL', { month: 'long', timeZone: 'UTC' });
  var DNI = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

  var dzis = K.dzis();
  var stan = { widok: 'lista', rok: +dzis.slice(0, 4), miesiac: +dzis.slice(5, 7) };
  try { var z = sessionStorage.getItem('kaciki-widok'); if (z) stan.widok = z; } catch (e) {}

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var klucz = function (r, m, d) { return r + '-' + pad(m) + '-' + pad(d); };
  var dniWMiesiacu = function (r, m) { return new Date(Date.UTC(r, m, 0)).getUTCDate(); };
  var duza = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var nazwaMiesiaca = function (r, m) { return duza(fMiesiacRok.format(new Date(Date.UTC(r, m - 1, 15)))); };

  // Mapa: dzień → wydarzenia, które go obejmują.
  var wgDni = function (terminy) {
    var mapa = {};
    terminy.forEach(function (t) {
      var r = K.dni(t);
      for (var k = r.od, i = 0; k <= r.do && i < 400; k = K.dodajDni(k, 1), i++) (mapa[k] = mapa[k] || []).push(t);
    });
    return mapa;
  };

  // Lista pogrupowana miesiącami (wydarzenie trafia do miesiąca, w którym się zaczyna).
  var listaMiesiecy = function (terminy, pusto) {
    if (!terminy.length) return '<p class="szary kal-pusto">' + pusto + '</p>';
    var grupy = [], ostatni = null;
    terminy.forEach(function (t) {
      var m = K.dni(t).od.slice(0, 7);
      if (m !== ostatni) { grupy.push({ m: m, t: [] }); ostatni = m; }
      grupy[grupy.length - 1].t.push(t);
    });
    return grupy.map(function (g) {
      return '<h3 class="kal-miesiac-tytul">' + nazwaMiesiaca(+g.m.slice(0, 4), +g.m.slice(5, 7)) + '</h3>' +
        '<ul class="terminy">' + g.t.map(K.termin).join('') + '</ul>';
    }).join('');
  };

  var siatka = function (r, m, mapa, male) {
    var pierwszy = klucz(r, m, 1);
    var przesuniecie = (K.naDate(pierwszy).getUTCDay() + 6) % 7;
    var start = K.dodajDni(pierwszy, -przesuniecie);
    var ile = Math.ceil((przesuniecie + dniWMiesiacu(r, m)) / 7) * 7;
    var html = '<div class="kal-siatka' + (male ? ' kal-siatka-mala' : '') + '" role="grid">' +
      DNI.map(function (d) { return '<div class="kal-dzien-tyg" role="columnheader">' + (male ? d.charAt(0) : d) + '</div>'; }).join('');
    for (var i = 0; i < ile; i++) {
      var k = K.dodajDni(start, i), w = mapa[k] || [];
      var inny = k.slice(0, 7) !== pierwszy.slice(0, 7);
      var klasy = 'kal-dzien' + (inny ? ' kal-inny' : '') + (k === dzis ? ' kal-dzis' : '') + (w.length && !inny ? ' kal-ma' : '');
      var opis = w.length ? ' title="' + K.esc(w.map(function (t) { return t.tytul; }).join(', ')) + '"' : '';
      html += '<div class="' + klasy + '" role="gridcell"' + opis + '><span class="kal-nr">' + +k.slice(8) + '</span>';
      if (!male && !inny) html += w.map(function (t) {
        return '<button type="button" class="kal-wyd" data-wydarzenie="' + K.esc(t.id) + '">' + K.esc(t.tytul) + '</button>';
      }).join('');
      html += '</div>';
    }
    return html + '</div>';
  };

  var widoki = {
    lista: {
      zakres: function () { return { od: dzis, do: K.dodajDni(dzis, 366), max: 100 }; },
      etykieta: function () { return 'Najbliższe 12 miesięcy'; },
      rysuj: function (t) { return listaMiesiecy(t, 'Brak zaplanowanych terminów w najbliższym roku.'); },
    },
    miesiac: {
      zakres: function () { return { od: klucz(stan.rok, stan.miesiac, 1), do: klucz(stan.rok, stan.miesiac, dniWMiesiacu(stan.rok, stan.miesiac)), max: 100 }; },
      etykieta: function () { return nazwaMiesiaca(stan.rok, stan.miesiac); },
      przesun: function (n) { var m = stan.miesiac - 1 + n; stan.rok += Math.floor(m / 12); stan.miesiac = ((m % 12) + 12) % 12 + 1; },
      rysuj: function (t) {
        var wMiesiacu = t.filter(function (x) { var r = K.dni(x), p = klucz(stan.rok, stan.miesiac, 1).slice(0, 7); return r.od.slice(0, 7) <= p && r.do.slice(0, 7) >= p; });
        return siatka(stan.rok, stan.miesiac, wgDni(t), false) +
          '<div class="kal-pod-siatka">' + (wMiesiacu.length ? '<ul class="terminy">' + wMiesiacu.map(K.termin).join('') + '</ul>' : '<p class="szary kal-pusto">Brak wydarzeń w tym miesiącu.</p>') + '</div>';
      },
    },
    rok: {
      zakres: function () { return { od: stan.rok + '-01-01', do: stan.rok + '-12-31', max: 250 }; },
      etykieta: function () { return String(stan.rok); },
      przesun: function (n) { stan.rok += n; },
      rysuj: function (t) {
        var mapa = wgDni(t), html = '<div class="kal-rok">';
        for (var m = 1; m <= 12; m++) {
          html += '<div class="kal-rok-miesiac"><button type="button" class="kal-rok-tytul" data-do-miesiaca="' + m + '">' +
            duza(fMiesiac.format(new Date(Date.UTC(stan.rok, m - 1, 15)))) + '</button>' + siatka(stan.rok, m, mapa, true) + '</div>';
        }
        return html + '</div>' + listaMiesiecy(t, 'Brak wydarzeń w tym roku.');
      },
    },
  };

  var licznik = 0;
  var rysuj = function () {
    var w = widoki[stan.widok] || widoki.lista;
    zakladki.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.widok === stan.widok); });
    nawigacja.hidden = !w.przesun;
    etykieta.textContent = w.etykieta();
    el.setAttribute('aria-busy', 'true');
    var moj = ++licznik;
    K.pobierz(w.zakres())
      .then(function (d) {
        if (moj !== licznik) return;
        if (d.skonfigurowany === false) { el.innerHTML = '<p class="szary">Kalendarz wkrótce. Aktualne wydarzenia znajdziesz na ' + K.KANNON + '.</p>'; return; }
        el.innerHTML = w.rysuj(d.terminy || []);
      })
      .catch(function () { if (moj === licznik) el.innerHTML = '<p class="szary">Nie udało się wczytać kalendarza. Spróbuj ponownie za chwilę.</p>'; })
      .then(function () { el.removeAttribute('aria-busy'); });
  };

  zakladki.forEach(function (b) {
    b.addEventListener('click', function () {
      stan.widok = b.dataset.widok;
      try { sessionStorage.setItem('kaciki-widok', stan.widok); } catch (e) {}
      rysuj();
    });
  });
  document.querySelectorAll('[data-przesun]').forEach(function (b) {
    b.addEventListener('click', function () { widoki[stan.widok].przesun(+b.dataset.przesun); rysuj(); });
  });
  document.querySelector('[data-kal-dzis]').addEventListener('click', function () {
    stan.rok = +dzis.slice(0, 4); stan.miesiac = +dzis.slice(5, 7); rysuj();
  });
  el.addEventListener('click', function (e) {
    var w = e.target.closest('[data-wydarzenie]');
    if (w) { K.otworz(w.dataset.wydarzenie); return; }
    var b = e.target.closest('[data-do-miesiaca]');
    if (!b) return;
    stan.miesiac = +b.dataset.doMiesiaca; stan.widok = 'miesiac';
    try { sessionStorage.setItem('kaciki-widok', stan.widok); } catch (e2) {}
    rysuj();
  });

  rysuj();
})();
