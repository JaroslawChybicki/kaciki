const WPISY = "src/zapiski/wpisy/*.md";

const dataPL = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/img": "img" });

  // Wpisy „Zapisków z Kącików” — bez szkiców, od najnowszego.
  eleventyConfig.addCollection("zapiski", (api) =>
    api.getFilteredByGlob(WPISY)
      .filter((p) => !p.data.szkic)
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("dataPL", (d) => dataPL.format(new Date(d)));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("isoData", (d) => new Date(d).toISOString().slice(0, 10));

  // Zdjęcia z panelu trafiają do repozytorium w pełnym rozmiarze;
  // na Netlify zmniejsza je w locie Image CDN.
  eleventyConfig.addFilter("foto", (url, szer = 1200) => {
    if (!url) return "";
    if (!process.env.NETLIFY) return url;
    return `/.netlify/images?url=${encodeURIComponent(url)}&w=${szer}&fm=webp&q=78`;
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
