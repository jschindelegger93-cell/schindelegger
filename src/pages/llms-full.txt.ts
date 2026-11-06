import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import s from '../data/settings.json';
import g from '../data/growth.json';
import p from '../data/preise.json';

export const GET: APIRoute = async () => {
  const leistungen = (await getCollection('leistungen')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
  const refs = (await getCollection('referenzen')).sort((a, b) => a.data.reihenfolge - b.data.reihenfolge);
  const parts: string[] = [`# ${s.firma} – Volltext\n\n${s.beschreibung}\n\nInhaber: ${s.inhaber}, ${s.ort}. Kontakt: ${s.email}, ${s.telefon}.`];
  parts.push(`## Growth System\n\n${g.hero.antwort}\n\n${g.module.map((m) => `### ${m.titel} (${m.rolle})\n${m.nutzen} ${m.zusammenspiel}`).join('\n\n')}`);
  parts.push(`## Preise\n\n${p.hero.antwort}\n\n${p.stufen.map((t) => `- ${t.name}: ${t.preis} ${t.einheit}, ${t.passend}`).join('\n')}\n\n${p.faq.map((f) => `**${f.frage}** ${f.antwort}`).join('\n\n')}`);
  for (const l of leistungen) {
    parts.push(`## ${l.data.titel}\n\n${l.data.antwort}\n\n${l.body ?? ''}\n\n${l.data.faq.map((f) => `**${f.frage}** ${f.antwort}`).join('\n\n')}`);
  }
  for (const r of refs) parts.push(`## Referenz: ${r.data.kunde}\n\n${r.data.kurz}\n\n${r.data.kennzahlen.map((k) => `- ${k.wert}: ${k.label}`).join('\n')}`);
  return new Response(parts.join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
