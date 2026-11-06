import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const seo = z
  .object({
    title: z.string().max(70).optional(),
    description: z.string().max(170).optional(),
    keyword: z.string().optional(),
    image: z.string().optional(),
    canonical: z.string().optional(),
    noindex: z.boolean().default(false),
  })
  .default({ noindex: false });

const faq = z.array(z.object({ frage: z.string(), antwort: z.string() })).default([]);

const leistungen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leistungen' }),
  schema: z.object({
    titel: z.string(),
    reihenfolge: z.number().default(50),
    hauptleistung: z.boolean().default(false),
    fundament: z.boolean().default(false),
    kurz: z.string(),
    h1: z.string(),
    intro: z.string(),
    antwort: z.string(),
    bild: z.string(),
    bildAlt: z.string().default(''),
    schwerpunkte: z.array(z.string()).default([]),
    enthalten: z.array(z.object({ titel: z.string(), text: z.string() })).default([]),
    leistungen: z.array(z.string()).default([]),
    werkzeuge: z.array(z.string()).default([]),
    faq,
    verwandt: z.array(z.string()).default([]),
    seo,
  }),
});

const referenzen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/referenzen' }),
  schema: z.object({
    kunde: z.string(),
    titel: z.string(),
    reihenfolge: z.number().default(50),
    kategorie: z.string(),
    branche: z.string(),
    kurz: z.string(),
    tags: z.array(z.string()).default([]),
    ziel: z.string(),
    kennzahlen: z.array(z.object({ wert: z.string(), label: z.string() })).default([]),
    vorgehen: z.array(z.string()).default([]),
    bild: z.string(),
    bildAlt: z.string().default(''),
    galerie: z.array(z.string()).default([]),
    videos: z.array(z.object({ src: z.string(), poster: z.string().optional(), titel: z.string().optional() })).default([]),
    zitat: z.object({ text: z.string(), name: z.string(), rolle: z.string(), bild: z.string().optional() }).optional(),
    featured: z.boolean().default(false),
    seo,
  }),
});

const ratgeber = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ratgeber' }),
  schema: z.object({
    titel: z.string(),
    kurz: z.string(),
    kategorie: z.string().default('Ratgeber'),
    datum: z.coerce.date(),
    aktualisiert: z.coerce.date().optional(),
    lesezeit: z.number().default(5),
    bild: z.string(),
    bildAlt: z.string().default(''),
    faq,
    seo,
  }),
});

const branchen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/branchen' }),
  schema: z.object({
    titel: z.string(),
    reihenfolge: z.number().default(50),
    icon: z.string().default('target'),
    kurz: z.string(),
    h1: z.string(),
    intro: z.string(),
    antwort: z.string(),
    bild: z.string(),
    bildAlt: z.string().default(''),
    probleme: z.array(z.object({ titel: z.string(), text: z.string() })).default([]),
    hebel: z.array(z.object({ titel: z.string(), text: z.string() })).default([]),
    ergebnisse: z.array(z.string()).default([]),
    referenzen: z.array(z.string()).default([]),
    leistungen: z.array(z.string()).default([]),
    faq,
    seo,
  }),
});

export const collections = { leistungen, referenzen, ratgeber, branchen };
