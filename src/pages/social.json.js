// Feed JSON para automatización de redes (n8n, Metricool, Buffer...).
// Por cada resumen ya publicado, entrega el texto listo para cada plataforma.
import { getPublicados } from '../lib/content.mjs';
import { SITE } from '../config.mjs';

export async function GET() {
  const entries = await getPublicados();

  const posts = entries.map((e) => {
    const url = `${SITE.url}/resumenes/${e.slug}`;
    const idea = e.data.ideasClave?.[0] || e.data.descripcion;
    const hashtags = '#ventas #psicologiadeventas #alexhormozi';

    return {
      fecha: e.data.fecha.toISOString().slice(0, 10),
      slug: e.slug,
      titulo: e.data.titulo,
      url,
      dia: e.data.dia ?? null,
      serie: e.data.serieNombre ?? null,
      audio: e.data.audio ? `${SITE.url}${e.data.audio}` : null,
      // Texto listo para cada red:
      whatsapp: `💡 ${idea}\n\n📲 Lee la lección completa: ${url}`,
      instagram: `${e.data.titulo}\n\n${e.data.descripcion}\n\n👉 Enlace en la bio o: ${url}\n\n${hashtags}`,
      facebook: `${e.data.titulo}\n\n${e.data.descripcion}\n\n📖 ${url}`,
      linkedin: `${e.data.titulo}\n\n${e.data.descripcion}\n\n${e.data.ideasClave?.map((i) => `• ${i}`).join('\n') || ''}\n\n📖 Resumen completo: ${url}\n\n${hashtags}`,
    };
  });

  return new Response(JSON.stringify({ site: SITE.url, actualizado: new Date().toISOString(), posts }, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
