import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Baut nach dem Build in jedes <img> ein srcset mit der 800-px-Variante ein (siehe scripts/bilder-optimieren.py)
// und ergänzt decoding="async". Bilder ohne Variante bleiben unverändert.
function responsiveBilder() {
  return {
    name: 'responsive-bilder',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        let varianten = {};
        try { varianten = JSON.parse(readFileSync('src/data/bild-varianten.json', 'utf8')); } catch { return; }
        const html = [];
        const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && html.push(p); });
        walk(root);
        for (const datei of html) {
          const alt = readFileSync(datei, 'utf8');
          const neu = alt.replace(/<img\b[^>]*>/g, (tag) => {
            if (!/decoding=/.test(tag)) tag = tag.replace('<img', '<img decoding="async"');
            if (/srcset=/.test(tag)) return tag;
            const src = tag.match(/\ssrc="([^"]+)"/)?.[1];
            const v = src && varianten[src];
            if (!v) return tag;
            const sizes = /\ssizes=/.test(tag) ? '' : ' sizes="(max-width: 860px) 100vw, 50vw"';
            return tag.replace('<img', `<img srcset="${v.v} ${v.vw}w, ${src} ${v.w}w"${sizes}`);
          });
          if (neu !== alt) writeFileSync(datei, neu);
        }
      },
    },
  };
}

// [PLATZHALTER] finale Domain eintragen
export default defineConfig({
  site: 'https://schindelegger.at',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (p) => !p.includes('/danke/') && !p.includes('/admin/') }), responsiveBilder()],
});
