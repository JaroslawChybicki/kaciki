// Wpisy i dokumenty dodawane w panelu dostają układ i adres automatycznie,
// żeby w ich folderach nie było żadnych plików technicznych.
const RODZAJE = [
  { folder: "/zapiski/wpisy/", layout: "wpis.njk", url: "/zapiski/" },
  { folder: "/dokumenty/pliki/", layout: "dokument.njk", url: "/dokumenty/" },
];
const rodzaj = (d) => RODZAJE.find((r) => d.page.inputPath.includes(r.folder));

export default {
  layout: (d) => rodzaj(d)?.layout ?? d.layout,
  permalink: (d) => {
    const r = rodzaj(d);
    if (!r) return d.permalink;
    return d.szkic ? false : `${r.url}${d.page.fileSlug}/`;
  },
};
