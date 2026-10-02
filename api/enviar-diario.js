// Envía el correo diario a los suscriptores (Blob) avisando del post que sale hoy.
// Proveedor: Resend. No hace nada si falta RESEND_API_KEY.
//
// Requisitos en Vercel (Environment Variables):
//   - RESEND_API_KEY     = tu clave de Resend
//   - COMENTARIOS_TOKEN  = clave para proteger el endpoint (ya la tienes)
//   - EMAIL_FROM         = "Resúmenes de Negocios <resumenes@andersonmares.com>"  (opcional)
//   - BLOB_READ_WRITE_TOKEN = (ya existe; para leer los suscriptores)
//
// Uso (siempre con token):
//   GET /api/enviar-diario?token=TU_TOKEN&dry=1          → cuenta qué enviaría, sin enviar
//   GET /api/enviar-diario?token=TU_TOKEN&test=tu@mail   → envía SOLO a esa dirección (prueba)
//   GET /api/enviar-diario?token=TU_TOKEN                → envía a todos el post de hoy
//   GET /api/enviar-diario?token=TU_TOKEN&slug=mi-post   → fuerza un post concreto
import { list } from '@vercel/blob';
import crypto from 'node:crypto';
import { SITE } from '../src/config.mjs';

const ARCHIVO = 'suscriptores.json';
const SECRET = process.env.COMENTARIOS_TOKEN || '';
const RESEND = process.env.RESEND_API_KEY || '';
const FROM = process.env.EMAIL_FROM || `Resúmenes de Negocios <resumenes@andersonmares.com>`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  let par = Object.entries(process.env).find(([k]) => k.endsWith('_READ_WRITE_TOKEN'));
  if (par) return par[1];
  par = Object.entries(process.env).find(([, v]) => typeof v === 'string' && v.startsWith('vercel_blob_rw_'));
  return par ? par[1] : undefined;
}

async function leerSuscriptores() {
  const token = blobToken();
  if (!token) return [];
  try {
    const { blobs } = await list({ prefix: ARCHIVO, token });
    const b = blobs.find((x) => x.pathname === ARCHIVO);
    if (!b) return [];
    const r = await fetch(b.downloadUrl || b.url, { cache: 'no-store', headers: { authorization: `Bearer ${token}` } });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Token de baja firmado (para que nadie pueda dar de baja a otro)
export function firmaBaja(email) {
  return crypto.createHmac('sha256', SECRET).update(String(email).toLowerCase()).digest('hex').slice(0, 24);
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function plantilla(post, email) {
  const baja = `${SITE.url}/api/baja?e=${encodeURIComponent(email)}&t=${firmaBaja(email)}`;
  const ideas = (post.ideasClave || []).slice(0, 3)
    .map((i) => `<li style="margin:0 0 8px;color:#334155;font-size:15px;line-height:1.5">${esc(i)}</li>`).join('');
  const extra = [];
  if (post.spotify) extra.push(`<a href="${esc(post.spotify)}" style="color:#1d4ed8;text-decoration:none">🎧 Escuchar el podcast</a>`);
  if (post.youtube) {
    const yurl = /^https?:/.test(post.youtube) ? post.youtube : `https://youtu.be/${post.youtube}`;
    extra.push(`<a href="${esc(yurl)}" style="color:#1d4ed8;text-decoration:none">▶️ Ver el vídeo</a>`);
  }
  const extraHtml = extra.length ? `<p style="margin:18px 0 0;font-size:14px">${extra.join(' &nbsp;·&nbsp; ')}</p>` : '';
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f1f5f9;padding:24px 0;font-family:Arial,Helvetica,sans-serif">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(post.preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <tr><td style="background:#1e3a8a;padding:20px 28px">
        <span style="color:#fff;font-weight:800;font-size:18px">${esc(SITE.name)}</span>
        ${post.serieNombre ? `<span style="color:#bfdbfe;font-size:13px;display:block;margin-top:2px">Serie · ${esc(post.serieNombre)}</span>` : ''}
      </td></tr>
      <tr><td style="padding:28px">
        <p style="margin:0 0 6px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.04em">Nuevo resumen de hoy</p>
        <h1 style="margin:0 0 14px;color:#0f172a;font-size:22px;line-height:1.3">${esc(post.titulo)}</h1>
        <p style="margin:0 0 18px;color:#334155;font-size:16px;line-height:1.6">${esc(post.entradilla)}</p>
        ${ideas ? `<ul style="margin:0 0 22px;padding-left:20px">${ideas}</ul>` : ''}
        <a href="${esc(post.url)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:13px 26px;border-radius:10px">${esc(post.cta)}</a>
        ${extraHtml}
      </td></tr>
      <tr><td style="padding:18px 28px;border-top:1px solid #e2e8f0;background:#f8fafc">
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
          Recibes este correo porque te suscribiste en ${esc(SITE.name)}.<br>
          <a href="${baja}" style="color:#64748b">Darme de baja</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export default async function handler(req, res) {
  const token = req.query?.token;
  if (!SECRET || token !== SECRET) return res.status(401).json({ error: 'No autorizado' });
  if (!RESEND) return res.status(500).json({ error: 'Falta RESEND_API_KEY en Vercel' });

  // Posts publicados
  let posts;
  try {
    posts = await (await fetch(`${SITE.url}/posts.json`, { cache: 'no-store' })).json();
  } catch (e) {
    return res.status(500).json({ error: 'No pude leer /posts.json', detalle: String(e).slice(0, 150) });
  }

  // Qué post(s) toca(n) hoy (fecha de Colombia), o uno forzado por slug/fecha
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // YYYY-MM-DD
  const diaObjetivo = req.query?.fecha || hoy;
  let delDia = req.query?.slug
    ? posts.filter((p) => p.slug === req.query.slug)
    : posts.filter((p) => String(p.fecha).slice(0, 10) === diaObjetivo);

  if (!delDia.length) return res.status(200).json({ ok: true, enviados: 0, msg: `No hay post para ${diaObjetivo}` });

  // Destinatarios
  let subs = await leerSuscriptores();
  if (req.query?.test) subs = [{ email: String(req.query.test).toLowerCase() }];

  if (req.query?.dry) {
    return res.status(200).json({ ok: true, dia: diaObjetivo, posts: delDia.map((p) => p.slug), suscriptores: subs.length });
  }
  if (!subs.length) return res.status(200).json({ ok: true, enviados: 0, msg: 'No hay suscriptores' });

  let ok = 0, fail = 0;
  for (const post of delDia) {
    for (const s of subs) {
      if (!s?.email) continue;
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { authorization: `Bearer ${RESEND}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            from: FROM,
            to: [s.email],
            subject: post.asunto,
            html: plantilla(post, s.email),
            headers: { 'List-Unsubscribe': `<${SITE.url}/api/baja?e=${encodeURIComponent(s.email)}&t=${firmaBaja(s.email)}>` },
          }),
        });
        r.ok ? ok++ : fail++;
      } catch {
        fail++;
      }
      await sleep(600); // respeta el límite de ~2/seg de Resend
    }
  }
  res.status(200).json({ ok: true, dia: diaObjetivo, posts: delDia.map((p) => p.slug), enviados: ok, fallidos: fail });
}
