const regex = />([^<>{}\n]*)((?:[a-zA-ZşğüöçıİÖÇŞĞÜ0-9][^<>{}\n]*)+)</g;
let content = `<div> Merhaba dünya </div>
<span>{variable} merhaba</span>`;

console.log(content.replace(regex, (match, space, text) => {
  return `>${space}{t("${text.trim()}")}<`;
}));
