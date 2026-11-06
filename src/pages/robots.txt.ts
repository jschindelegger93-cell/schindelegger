import type { APIRoute } from 'astro';
import { DUMMY_MODE } from '../config';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).toString();
  const body = DUMMY_MODE
    ? `# Klickdummy – BEI GO-LIVE DUMMY_MODE in src/config.ts auf false setzen\nUser-agent: *\nDisallow: /\n`
    : [
        'User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /danke/', '',
        '# KI-Crawler ausdrücklich erlaubt (GEO)',
        ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'].flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
        `Sitemap: ${sitemap}`, '',
      ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
