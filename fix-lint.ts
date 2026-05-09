import fs from 'fs';

const linesToRemove = new Set([
  190, 191, 466, 467,
  875, 876, 877, 878, 879, 880, 881, 882,
  884, 885, 886, 887, 888, 889,
  891, 892, 893, 894, 895, 896,
  898, 899, 900, 901,
  903, 904, 905,
  907, 908, 909,
  911, 912, 913,
  915, 916, 917,
  919, 920, 921,
  923, 924, 925,
  927, 928, 929,
  1220, 1221, 1225, 1226
]);

const content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
const lines = content.split('\n');
const newLines = lines.filter((_, i) => !linesToRemove.has(i + 1));

fs.writeFileSync('src/contexts/LanguageContext.tsx', newLines.join('\n'));
console.log('Fixed lines');
