// Panel de administración local del contenido del sitio.
// Edita los .md de src/content/resumenes, sube documentos a un Blob PÚBLICO
// (para no cargar el repo) y publica con git push.
import express from 'express';
import multer from 'multer';
import matter from 'gray-matter';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { put } from '@vercel/blob';

const __dirname = dirname(fileURLToPath(import.meta.url));
// El repo se monta en /repo dentro de Docker; en local usa la carpeta padre.
const REPO = process.env.REPO_DIR || join(__dirname, '..');
const RES = join(REPO, 'src', 'content', 'resumenes');
const PORT = process.env.PORT || 4322;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const GH_TOKEN = process.env.GH_TOKEN || '';
const GH_REPO = process.env.GH_REPO || 'anderman1981/resumenes-negocios';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(join(__dirname, 'public')));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const slugRe = /^[a-z0-9-]+$/;

// Lista de artículos
app.get('/api/list', (req, res) => {
  const files = readdirSync(RES).filter((f) => f.endsWith('.md'));
  const items = files.map((f) => {
    const slug = f.replace(/\.md$/, '');
    const { data } = matter(readFileSync(join(RES, f), 'utf8'));
    return { slug, titulo: data.titulo || slug, categoria: data.categoria || '', fecha: data.fecha || '', borrador: !!data.borrador };
  }).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  res.json({ items });
});

// Leer un artículo
app.get('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  const file = join(RES, `${slug}.md`);
  if (!existsSync(file)) return res.status(404).json({ error: 'No existe' });
  const { data, content } = matter(readFileSync(file, 'utf8'));
  res.json({ slug, data, content });
});

// Guardar (crear o editar) un artículo
app.post('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  if (!slugRe.test(slug)) return res.status(400).json({ error: 'Slug inválido (usa minúsculas, números y guiones)' });
  const { data = {}, content = '' } = req.body || {};
  try {
    const md = matter.stringify(content, data);
    writeFileSync(join(RES, `${slug}.md`), md, 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e).slice(0, 200) });
  }
});

// Subir un documento/audio/imagen al Blob PÚBLICO → devuelve URL para pegar en un enlace
app.post('/api/subir', upload.single('archivo'), async (req, res) => {
  if (!BLOB_TOKEN) return res.status(500).json({ error: 'Falta BLOB_READ_WRITE_TOKEN (store público) en el .env del admin.' });
  if (!req.file) return res.status(400).json({ error: 'No llegó archivo' });
  try {
    const carpeta = (req.body.carpeta || 'media').replace(/[^a-z0-9/_-]/gi, '');
    const nombre = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = await put(`${carpeta}/${nombre}`, req.file.buffer, {
      access: 'public', addRandomSuffix: false, allowOverwrite: true,
      contentType: req.file.mimetype, token: BLOB_TOKEN,
    });
    res.json({ ok: true, url: blob.url });
  } catch (e) {
    res.status(500).json({ error: String(e).slice(0, 200) });
  }
});

// Publicar: git add + commit + push
app.post('/api/publicar', (req, res) => {
  try {
    execSync('git add -A', { cwd: REPO });
    try { execSync('git commit -q -m "admin: actualiza contenido"', { cwd: REPO }); }
    catch (e) { return res.json({ ok: true, msg: 'No había cambios para publicar.' }); }
    if (GH_TOKEN) {
      const url = `https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git`;
      execSync(`git push ${url} HEAD:main`, { cwd: REPO });
    } else {
      execSync('git push origin main', { cwd: REPO });
    }
    res.json({ ok: true, msg: 'Publicado. Vercel desplegará en ~1 min.' });
  } catch (e) {
    res.status(500).json({ error: 'Error al publicar: ' + String(e).slice(0, 250) + ' (configura GH_TOKEN o haz git push manual)' });
  }
});

app.listen(PORT, () => console.log(`✅ Admin en http://localhost:${PORT}`));
