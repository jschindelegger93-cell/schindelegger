# schindelegger.

Website von Julian Schindelegger – eCommerce Performance Marketing aus Wien.
Astro + Sveltia CMS (unter `/admin`), gehostet auf Netlify.

## Lokal
npm install
npm run dev

## Netlify
1. app.netlify.com → „Add new site“ → „Import from Git“ → Repo `jschindelegger93-cell/schindelegger`
2. Build command `npm run build`, Publish directory `dist` (steht schon in netlify.toml)
3. Für das CMS: Sveltia mit GitHub-Login, Repo in `public/admin/config.yml` ist eingetragen

## Go-live
- `src/config.ts`: `DUMMY_MODE = false` (sonst noindex)
- Domain in `astro.config.mjs` prüfen (`https://schindelegger.at`)
- Platzhalter in `src/data/settings.json` füllen (Adresse, UID, Telefon, E-Mail)
