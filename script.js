(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  var header = document.querySelector('.site-header');

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }
  });

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Poza Netlify (np. GitHub Pages) formularz nie ma backendu — otwieramy gotową wiadomość e-mail.
  var form = document.querySelector('form[name="kontakt"]');
  var mail = document.querySelector('.contact-line a[href^="mailto:"]');
  if (form && mail && !/netlify\.app$/.test(location.hostname)) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var body = d.get('wiadomosc') + '\n\n— ' + d.get('imie') + ' (' + d.get('email') + ')';
      location.href = mail.getAttribute('href') +
        '?subject=' + encodeURIComponent('[Kąciki Zen] ' + d.get('temat')) +
        '&body=' + encodeURIComponent(body);
    });
  }
})();
