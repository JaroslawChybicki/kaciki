// Wpisy dodawane w panelu (src/zapiski/wpisy/*.md) dostają układ i adres automatycznie,
// żeby w folderze z wpisami nie było żadnych plików technicznych.
const jestWpisem = (d) => d.page.inputPath.includes("/zapiski/wpisy/");

export default {
  layout: (d) => (jestWpisem(d) ? "wpis.njk" : d.layout),
  permalink: (d) => {
    if (!jestWpisem(d)) return d.permalink;
    return d.szkic ? false : `/zapiski/${d.page.fileSlug}/`;
  },
};
