// Feed RSS de podcast (compatible con Spotify / Apple Podcasts).
// Registra esta URL UNA vez en tu proveedor y cada episodio nuevo se publica solo.
// Un episodio se incluye si el resumen tiene `audioPublico` (URL pública del audio)
// o un `audio` local (servido desde el propio sitio).
import { getPublicados } from '../lib/content.mjs';
import { SITE } from '../config.mjs';
import { statSync } from 'node:fs';
import { join } from 'node:path';

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const entries = await getPublicados();
  const items = [];

  for (const e of entries) {
    const pub = e.data.audioPublico || (e.data.audio && e.data.audio.startsWith('/') ? `${SITE.url}${e.data.audio}` : null);
    if (!pub) continue; // sin audio no es episodio de podcast
    let length = 0;
    if (e.data.audio && e.data.audio.startsWith('/audio/')) {
      try { length = statSync(join(process.cwd(), 'public', e.data.audio)).size; } catch (err) {}
    }
    const url = `${SITE.url}/resumenes/${e.slug}`;
    items.push(`    <item>
      <title>${esc(e.data.titulo)}</title>
      <description>${esc(e.data.descripcion)}</description>
      <link>${url}</link>
      <guid isPermaLink="false">${e.slug}</guid>
      <pubDate>${e.data.fecha.toUTCString()}</pubDate>
      <enclosure url="${esc(pub)}" length="${length}" type="audio/mpeg" />
      <itunes:author>${esc(SITE.author)}</itunes:author>
      <itunes:summary>${esc(e.data.descripcion)}</itunes:summary>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <language>es</language>
    <description>${esc(SITE.description)}</description>
    <itunes:author>${esc(SITE.author)}</itunes:author>
    <itunes:owner><itunes:name>${esc(SITE.author)}</itunes:name><itunes:email>${esc(SITE.email)}</itunes:email></itunes:owner>
    <itunes:image href="${SITE.url}/og-default.png" />
    <itunes:category text="Business" />
    <itunes:explicit>false</itunes:explicit>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
