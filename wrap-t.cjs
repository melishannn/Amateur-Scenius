const fs = require('fs');

function translateJSXText(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Any text between > and < that contains Turkish characters or at least 4 letters, ignoring {} and tags
  content = content.replace(/>\s*([^<>{}\n]+?)\s*</g, (match, text) => {
    if (!/[A-Za-zşğüöçıİÖÇŞĞÜ]{3,}/.test(text)) return match;
    const trimmed = text.trim();
    if (trimmed.startsWith('=')) return match; // skip condition lines like '= 3 &&'
    const originalSpaceMatch = match.match(/^>\s*/);
    const endSpaceMatch = match.match(/\s*</);
    const startSpace = originalSpaceMatch ? originalSpaceMatch[0].slice(1) : '';
    const endSpace = endSpaceMatch ? endSpaceMatch[0].slice(0, -1) : '';
    
    // escape quotes
    const safeText = trimmed.replace(/'/g, "\\'");
    return `>${startSpace}{t('${safeText}')}${endSpace}<`;
  });

  // check if 'const { t } = useLanguage();' is there, if not inject it
  if (!content.includes('const { t } = useLanguage();')) {
    content = content.replace(/import \{ useState/, "import { useLanguage } from '../contexts/LanguageContext';\nimport { useState");
    content = content.replace(/export default function \w+\([^)]*\) \{/, (match) => {
      return match + "\n  const { t } = useLanguage();";
    });
  }

  fs.writeFileSync(file, content);
}

translateJSXText('src/components/Cabinet.tsx');
translateJSXText('src/components/Wizard.tsx');
