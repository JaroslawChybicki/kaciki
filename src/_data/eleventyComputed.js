// Wpisy i dokumenty dodawane w panelu dostają układ i adres automatycznie,
// żeby w ich folderach nie było żadnych plików technicznych.
const RODZAJE = [
  { folder: "/aktualnosci/wpisy/", layout: "wpis.njk", url: "/aktualnosci/", sekcja: "Aktualności" },
  { folder: "/zapiski/wpisy/", layout: "wpis.njk", url: "/zapiski/", sekcja: "Zapiski z Kącików" },
  { folder: "/dokumenty/pliki/", layout: "dokument.njk", url: "/dokumenty/", sekcja: "Dokumenty" },
];
const rodzaj = (d) => RODZAJE.find((r) => d.page.inputPath.includes(r.folder));

export default {
  layout: (d) => rodzaj(d)?.layout ?? d.layout,
  sekcja: (d) => (rodzaj(d) ? { nazwa: rodzaj(d).sekcja, url: rodzaj(d).url } : d.sekcja),
  permalink: (d) => {
    const r = rodzaj(d);
    if (!r) return d.permalink;
    return d.szkic ? false : `${r.url}${d.page.fileSlug}/`;
  },
};
