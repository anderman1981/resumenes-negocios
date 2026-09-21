import rss from '@astrojs/rss';
import { getPublicados } from '../lib/content.mjs';
import { SITE } from '../config.mjs';

export async function GET(context) {
  const entries = await getPublicados();

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.titulo,
      description: entry.data.descripcion,
      pubDate: entry.data.fecha,
      link: `/resumenes/${entry.slug}/`,
      categories: [entry.data.categoria, ...entry.data.tags],
    })),
    customData: `<language>es-es</language>`,
  });
}
