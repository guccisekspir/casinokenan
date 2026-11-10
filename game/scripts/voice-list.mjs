// Kaydedilmesi gereken ses dosyalarının listesini üretir:
//   VOICE_LINES.md   — okunaklı liste (karakter > olay > replik, dosya adı, kayıt var mı)
//   voice-lines.csv  — toplu seslendirme araçları için (dosya, karakter, olay, metin)
// Çalıştır: npm run voice-list
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const linesDir = join(root, 'src/lines');

// Olay açıklamaları ve sırası tek yerden: src/dialogue.ts içindeki EVENT_INFO.
const info = new Map();
for (const m of readFileSync(join(root, 'src/dialogue.ts'), 'utf8').matchAll(/^\s+(\w+): \{.*when: '(.*)' \},$/gm)) {
  info.set(m[1], m[2]);
}
const names = Object.fromEntries(
  [...readFileSync(join(root, 'src/characters.ts'), 'utf8').matchAll(/id: '([\w-]+)',\s+name: '([^']+)'/g)].map((m) => [m[1], m[2]]),
);

let md = `# Ses dosyaları\n\nBu dosya \`npm run voice-list\` ile üretilir; elle düzenlemeyin. Replikleri değiştirmek için\n\`src/lines/<karakter>.json\` dosyalarını düzenleyip komutu yeniden çalıştırın.\n\n- Biçim: **mp3**, mono, tek replik = tek dosya, baştaki/sondaki sessizlik kırpılmış.\n- Konum: \`public/audio/<karakter>/<olay>_<n>.mp3\`\n- Dosyası olmayan replik oyunda tarayıcının sesli okumasıyla söylenir; yani kayıtlar parça parça eklenebilir.\n- Her olayın alternatifleri vardır; oyun hepsini söylemeden hiçbirini tekrar etmez.\n`;
const csv = ['dosya,karakter,olay,metin'];
let total = 0, have = 0;

for (const file of readdirSync(linesDir).filter((f) => f.endsWith('.json')).sort()) {
  const id = file.replace('.json', '');
  const lines = JSON.parse(readFileSync(join(linesDir, file), 'utf8'));
  const count = Object.values(lines).reduce((n, a) => n + a.length, 0);
  md += `\n## ${names[id] ?? id} — ${count} replik\n\nKlasör: \`public/audio/${id}/\`\n`;
  for (const event of [...info.keys()].filter((e) => lines[e])) {
    md += `\n### ${event}\n\n${info.get(event)}\n\n| Dosya | Replik | Kayıt |\n| --- | --- | --- |\n`;
    lines[event].forEach((text, i) => {
      const name = `${event}_${i + 1}.mp3`;
      const ok = existsSync(join(root, 'public/audio', id, name));
      total++;
      if (ok) have++;
      md += `| \`${name}\` | ${text.replace(/\|/g, '\\|')} | ${ok ? 'var' : '—'} |\n`;
      csv.push(`audio/${id}/${name},${id},${event},"${text.replace(/"/g, '""')}"`);
    });
  }
  const unknown = Object.keys(lines).filter((e) => !info.has(e));
  if (unknown.length) console.warn(`[${id}] tanımsız olay(lar): ${unknown.join(', ')}`);
}

md = md.replace('# Ses dosyaları\n', `# Ses dosyaları\n\nToplam **${total}** replik, kaydı olan: **${have}**.\n`);
// Kayıt envanteri: oyun hangi repliklerin kaydı olduğunu buradan bilir. Bir olayın kayıtlı
// replikleri varsa oyun yalnızca onları söyler (kayıt ile sesli okuma karışmasın).
const recorded = [];
const walk = (dir, prefix) => {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(dir, e.name), `${prefix}${e.name}/`);
    else if (e.name.endsWith('.mp3')) recorded.push(`${prefix}${e.name.replace('.mp3', '')}`);
  }
};
walk(join(root, 'public/audio'), '');
writeFileSync(join(root, 'src/voice-manifest.json'), JSON.stringify(recorded.sort(), null, 2) + '\n');
console.log(`${recorded.length} kayıt dosyası -> src/voice-manifest.json`);

writeFileSync(join(root, 'VOICE_LINES.md'), md);
writeFileSync(join(root, 'voice-lines.csv'), csv.join('\n') + '\n');
console.log(`${total} replik (${have} kayıtlı) -> VOICE_LINES.md, voice-lines.csv`);
