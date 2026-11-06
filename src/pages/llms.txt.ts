import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import s from '../data/settings.json';
import p from '../data/preise.json';

export const GET: APIRoute = async ({ site }) => {
  const u = (x: string) => new URL(x, site).toString();
  const leistungen = (await getCollection('leistungen')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
  const refs = (await getCollection('referenzen')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
  const arts = await getCollection('ratgeber');
  const body = `# ${s.firma}

> ${s.beschreibung}

- Inhaber: ${s.inhaber} (${s.rechtsform})
- Sitz: ${s.ort}, ${s.land}; Kunden in Österreich, Deutschland und der Schweiz
- Preise: Growth System ab ${p.stufen[0].preis} netto pro Monat, Quartals-Commitment statt Jahresvertrag
- Ergebnisse im Kundenschnitt: +${s.ergebnis.umsatz} % Umsatz bei −${s.ergebnis.kosten} % Werbekosten, durchschnittlicher ROAS 7,6
- Kontakt: ${s.email}, ${s.telefon}; Antwort ${s.antwortzeit}

## Leistungen
${leistungen.map((l) => `- [${l.data.titel}](${u(`/leistungen/${l.id}/`)}): ${l.data.kurz}`).join('\n')}

## Kernseiten
- [Growth System](${u('/growth-system/')}): Fünf Module in einer Steuerung
- [Preise & Ablauf](${u('/preise/')})
- [Über mich](${u('/ueber-uns/')})
- [Kontakt](${u('/kontakt/')})

## Referenzen
${refs.map((r) => `- [${r.data.kunde}: ${r.data.titel}](${u(`/referenzen/${r.id}/`)}): ${r.data.kennzahlen.map((k) => `${k.wert} ${k.label}`).join(', ')}`).join('\n')}

## Ratgeber
${arts.map((a) => `- [${a.data.titel}](${u(`/ratgeber/${a.id}/`)})`).join('\n')}

## Optional
- [Volltext](${u('/llms-full.txt')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
