// Baja de la lista de suscriptores (Blob). Enlace firmado para que nadie
// pueda dar de baja a otra persona. Lo usa el "Darme de baja" del correo diario.
//   GET /api/baja?e=<email>&t=<firma>
import { put, list } from '@vercel/blob';
import crypto from 'node:crypto';

const ARCHIVO = 'suscriptores.json';
const SECRET = process.env.COMENTARIOS_TOKEN || '';

function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  let par = Object.entries(process.env).find(([k]) => k.endsWith('_READ_WRITE_TOKEN'));
  if (par) return par[1];
  par = Object.entries(process.env).find(([, v]) => typeof v === 'string' && v.startsWith('vercel_blob_rw_'));
  return par ? par[1] : undefined;
}
const firma = (email) => crypto.createHmac('sha256', SECRET).update(String(email).toLowerCase()).digest('hex').slice(0, 24);

function pagina(titulo, msg) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;margin:0;display:grid;place-items:center;min-height:100vh">
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:40px;max-width:460px;text-align:center">
      <h1 style="color:#0f172a;font-size:22px;margin:0 0 10px">${titulo}</h1>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin:0">${msg}</p>
    </div>
  </body></html>`;
}

export default async function handler(req, res) {
  const email = String(req.query?.e || '').toLowerCase().trim();
  const t = req.query?.t;
  res.setHeader('content-type', 'text/html; charset=utf-8');

  if (!SECRET || !email || !t || t !== firma(email)) {
    return res.status(400).send(pagina('Enlace no válido', 'Este enlace de baja no es correcto o ha caducado. Si quieres darte de baja, responde al correo y te ayudamos.'));
  }
  const token = blobToken();
  if (!token) return res.status(500).send(pagina('Error', 'No se pudo procesar la baja en este momento.'));

  try {
    const { blobs } = await list({ prefix: ARCHIVO, token });
    const b = blobs.find((x) => x.pathname === ARCHIVO);
    let lista = [];
    if (b) {
      const r = await fetch(b.downloadUrl || b.url, { cache: 'no-store', headers: { authorization: `Bearer ${token}` } });
      if (r.ok) lista = await r.json();
    }
    const nueva = (Array.isArray(lista) ? lista : []).filter((s) => String(s.email).toLowerCase() !== email);
    await put(ARCHIVO, JSON.stringify(nueva, null, 2), {
      access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, token,
    });
    return res.status(200).send(pagina('Baja confirmada', 'Te hemos dado de baja. Ya no recibirás más correos. ¡Gracias por haber estado!'));
  } catch (e) {
    return res.status(500).send(pagina('Error', 'No se pudo procesar la baja. Inténtalo de nuevo más tarde.'));
  }
}
