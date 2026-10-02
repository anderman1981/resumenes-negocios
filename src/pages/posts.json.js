// Feed JSON de posts publicados — lo consume /api/enviar-diario para saber
// qué resumen sale hoy y con qué datos armar el correo.
import { getPublicados } from '../lib/content.mjs';
import { SITE } from '../config.mjs';

export async function GET() {
  const posts = (await getPublicados()).map((e) => ({
    slug: e.slug,
    titulo: e.data.titulo,
    descripcion: e.data.descripcion || '',
    fecha: e.data.fecha.toISOString(),
    ideasClave: e.data.ideasClave || [],
    spotify: e.data.spotify || '',
    youtube: e.data.youtube || '',
    serieNombre: e.data.serieNombre || '',
    url: `${SITE.url}/resumenes/${e.slug}`,
    // Copy del email: usa overrides del frontmatter si existen, si no cae al contenido del artículo
    asunto: e.data.emailAsunto || `Nuevo resumen: ${e.data.titulo}`,
    preheader: e.data.emailPreheader || e.data.descripcion || '',
    entradilla: e.data.emailEntradilla || e.data.descripcion || '',
    cta: e.data.emailCta || 'Leer el resumen de hoy',
  }));
  return new Response(JSON.stringify(posts), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
