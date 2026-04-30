const fs = require('fs');

function translateJSXText(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Any text between > and < that contains Turkish characters or letters, ignoring those with {}
  content = content.replace(/>\s*([^<>{}\n]+?)\s*</g, (match, text) => {
    if (!/[A-Za-zşğüöçıİÖÇŞĞÜ]/.test(text)) return match;
    const originalSpaceMatch = match.match(/^>\s*/);
    const endSpaceMatch = match.match(/\s*</);
    const startSpace = originalSpaceMatch ? originalSpaceMatch[0].slice(1) : '';
    const endSpace = endSpaceMatch ? endSpaceMatch[0].slice(0, -1) : '';
    
    // escape quotes
    const safeText = text.replace(/'/g, "\\'");
    return `>${startSpace}{t('${safeText}')}${endSpace}<`;
  });

  fs.writeFileSync(file, content);
}

translateJSXText('src/components/Cabinet.tsx');
translateJSXText('src/components/Wizard.tsx');
