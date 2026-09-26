
const dataPL = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/img": "img" });

  // Treści z panelu — bez szkiców, od najnowszego.
  const kolekcja = (nazwa, glob) =>
    eleventyConfig.addCollection(nazwa, (api) =>
      api.getFilteredByGlob(glob).filter((p) => !p.data.szkic).sort((a, b) => b.date - a.date)
    );
  kolekcja("aktualnosci", "src/aktualnosci/wpisy/*.md");
  kolekcja("zapiski", "src/zapiski/wpisy/*.md");
  kolekcja("dokumenty", "src/dokumenty/pliki/*.md");

  eleventyConfig.addFilter("dataPL", (d) => dataPL.format(new Date(d)));
  eleventyConfig.addFilter("wRodzaju", (arr, r) => (arr || []).filter((d) => d.data.kategoria === r));
  // Zwykły tekst z panelu → akapity HTML; polskie numery telefonów (np. 503-355-458) stają się linkami tel:.
  eleventyConfig.addFilter("akapity", (tekst) => {
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return String(tekst || "").trim().split(/\n\s*\n/).map((a) =>
      "<p>" + esc(a).replace(/\n/g, "<br>").replace(/(?<!\d)(\d{3})[ -](\d{3})[ -](\d{3})(?!\d)/g,
        (m, a1, a2, a3) => `<a class="link" href="tel:+48${a1}${a2}${a3}">${m}</a>`) + "</p>"
    ).join("");
  });
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("isoData", (d) => new Date(d).toISOString().slice(0, 10));

  // Zdjęcia z panelu trafiają do repozytorium w pełnym rozmiarze;
  // na Netlify zmniejsza je w locie Image CDN.
  eleventyConfig.addFilter("foto", (url, szer = 1200) => {
    if (!url) return "";
    if (!process.env.NETLIFY) return url;
    return `/.netlify/images?url=${encodeURIComponent(url)}&w=${szer}&fm=webp&q=78`;
  });

  // Zdjęcia wstawione w treść wpisu: zmniejszone przez CDN, leniwie ładowane, powiększane po kliknięciu.
  eleventyConfig.addFilter("zdjeciaWTresci", function (html) {
    const foto = eleventyConfig.getFilter("foto");
    return String(html).replace(/<img\b([^>]*?)\bsrc="(\/img\/uploads\/[^"]+)"([^>]*)>/g, (_, przed, src, po) => {
      const alt = (/\balt="([^"]*)"/.exec(przed + po) || [])[1] || "";
      return `<a href="${foto(src, 2000)}" data-lightbox data-podpis="${alt}">` +
        `<img${przed}src="${foto(src, 1400)}" loading="lazy"${po}></a>`;
    });
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
