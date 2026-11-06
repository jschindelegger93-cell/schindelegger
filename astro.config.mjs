import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// [PLATZHALTER] finale Domain eintragen
export default defineConfig({
  site: 'https://schindelegger.at',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (p) => !p.includes('/danke/') && !p.includes('/admin/') })],
});
