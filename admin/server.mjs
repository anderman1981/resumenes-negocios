import express from 'express';
import multer from 'multer';
import matter from 'gray-matter';
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.REPO_DIR || join(__dirname, '..');
const RES = join(REPO, 'src', 'content', 'resumenes');
const PUBLIC = join(REPO, 'public');
const PORT = process.env.PORT || 4322;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(join(__dirname, 'public')));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });
const slugRe = /^[a-z0-9-]+$/;

function fileSize(path) {
  try { return statSync(path).size; } catch { return 0; }
}
function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

app.get('/api/list', (req, res) => {
  const files = readdirSync(RES).filter(f => f.endsWith('.md'));
  const items = files.map(f => {
    const slug = f.replace(/\.md$/, '');
    const { data } = matter(readFileSync(join(RES, f), 'utf8'));
    const shortPath = data.short ? join(PUBLIC, data.short) : '';
    const audioPath = data.audio ? join(PUBLIC, data.audio) : '';
    return {
      slug,
      titulo: data.titulo || slug,
      libro: data.libro || '',
      autor: data.autor || '',
      categoria: data.categoria || '',
      fecha: data.fecha || '',
      borrador: !!data.borrador,
      serie: data.serie || '',
      serieNombre: data.serieNombre || '',
      dia: data.dia ?? null,
      hasYoutube: !!data.youtube,
      hasSpotify: !!data.spotify,
      hasAudio: !!(data.audio && existsSync(audioPath)),
      hasShort: !!(data.short && existsSync(shortPath)),
      hasPdf: !!data.pdf,
      shortPath: data.short || '',
      shortSize: shortPath ? fmtSize(fileSize(shortPath)) : '',
    };
  }).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  res.json({ items });
});

app.get('/api/stats', (req, res) => {
  const files = readdirSync(RES).filter(f => f.endsWith('.md'));
  let total = 0, published = 0, drafts = 0;
  let withYoutube = 0, withSpotify = 0, withAudio = 0, withShort = 0, withPdf = 0;
  files.forEach(f => {
    const { data } = matter(readFileSync(join(RES, f), 'utf8'));
    total++;
    if (data.borrador) drafts++; else published++;
    if (data.youtube) withYoutube++;
    if (data.spotify) withSpotify++;
    if (data.audio) withAudio++;
    if (data.short) withShort++;
    if (data.pdf) withPdf++;
  });
  const shortsDir = join(PUBLIC, 'shorts');
  let shortFiles = [];
  if (existsSync(shortsDir)) {
    shortFiles = readdirSync(shortsDir)
      .filter(f => f.endsWith('.mp4'))
      .map(f => ({ name: f, size: fmtSize(fileSize(join(shortsDir, f))) }));
  }
  res.json({ total, published, drafts, withYoutube, withSpotify, withAudio, withShort, withPdf, shortFiles });
});

app.get('/api/item/:slug', (req, res) => {
  const file = join(RES, `${req.params.slug}.md`);
  if (!existsSync(file)) return res.status(404).json({ error: 'No existe' });
  const { data, content } = matter(readFileSync(file, 'utf8'));
  res.json({ slug: req.params.slug, data, content });
});

app.post('/api/item/:slug', (req, res) => {
  const { slug } = req.params;
  if (!slugRe.test(slug)) return res.status(400).json({ error: 'Slug invalido' });
  const { data = {}, content = '' } = req.body || {};
  try {
    writeFileSync(join(RES, `${slug}.md`), matter.stringify(content, data), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e).slice(0, 200) });
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const folder = (req.body.folder || 'shorts').replace(/[^a-z0-9_-]/gi, '');
  const dest = join(PUBLIC, folder);
  mkdirSync(dest, { recursive: true });
  const name = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  writeFileSync(join(dest, name), req.file.buffer);
  res.json({ ok: true, url: `/${folder}/${name}`, size: fmtSize(req.file.size) });
});

app.get('/api/files/:folder', (req, res) => {
  const folder = req.params.folder.replace(/[^a-z0-9_-]/gi, '');
  const dir = join(PUBLIC, folder);
  if (!existsSync(dir)) return res.json({ files: [] });
  const files = readdirSync(dir).map(f => ({
    name: f,
    url: `/${folder}/${f}`,
    size: fmtSize(fileSize(join(dir, f))),
    ext: extname(f).slice(1),
  }));
  res.json({ files });
});

app.use('/preview', express.static(PUBLIC));

app.listen(PORT, () => console.log(`\n  Admin dashboard: http://localhost:${PORT}\n`));
