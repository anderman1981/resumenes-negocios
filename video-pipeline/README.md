# NaN Video Pipeline

**1st place, NaN builders hackathon.** A TypeScript pipeline that turns a topic into a
narrated 9:16 video using only open models (qwen3.6, gemma4, kokoro, whisper), from
script to rendered MP4.

▶️ **Demo:** https://lamjesus.github.io/nan-video-pipeline/

**Team:** [@mlorentedev](https://github.com/mlorentedev) ·
[@adriaansaeez](https://github.com/adriaansaeez) ·
[@lamjesus](https://github.com/lamjesus)

**Origin:** built on *Archivo Negro*, a video production pipeline Luis created for a
documentary shorts channel on YouTube ([@Caso91oficial](https://www.youtube.com/@Caso91oficial),
18 published videos), then ported to NaN's open models as a team for the hackathon.

---

A pipeline that turns a **topic** into a **short narrated video**, using only the
models in the **NaN** cluster (OpenAI-compatible API). No external services.

## Idea

```
Topic → script → visual selection → voice → subtitles → composition → render → MP4 (9:16)
```

Everything about a video lives in one central data structure (the `Storyboard`).
Each stage reads it and enriches it.

## Cluster models and their role

| Stage | Model | Role |
|-------|-------|------|
| Script | `qwen3.6` (`deepseek-v4-flash` as an alternative) | writes the structured storyboard |
| Vision | `gemma4` (fallback `qwen3.6`) | scores real candidate images sent as **base64, array format** (it does not generate images) |
| Voice | `kokoro` | Spanish narration (`em_alex` / `ef_dora`) |
| Subtitles | `whisper` | transcribes the voice to align the subtitles |
| Library / pre-ranking | `qwen3-embedding` | pre-ranks candidate images by title; RAG library of cases (Task E, pending) |

> `mimo-v2.5` (legacy vision) is **blind** in the cluster and is not used;
> details in [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).

Composition and render are local tools (HTML + GSAP + HyperFrames + FFmpeg).

> **About GSAP and HyperFrames:** they are not installable dependencies of this repo.
> GSAP is loaded from a CDN **inside each case's `index.html`** (it is a browser
> script, not a Node package). HyperFrames runs with `npx hyperframes render .`
> (resolved on the fly). That is why they are not in `package.json`: they come in
> when the composition is assembled, which is the render stage.
> FFmpeg does need to be installed on the system (`brew install ffmpeg`).

## Structure

```
config.yml             models + voice + providers (adjustable, no TS changes)
content/               cases (storyboards) in YAML — data, not code
src/
  config/index.ts      paths + cluster access + loading of config.yml and .env
  content/load.ts      case loader by argument (validates the YAML)
  lib/                 types, nan-client, nan-call (throttle), ffprobe,
                       manifest, media/ (wikimedia, pexels, local)
  pipeline/            00-orchestrator → 01-script → 02-vision → 03-voice →
                       05-subtitles → 04-compose → render-runner
                       (+ pure, testable logic in separate modules)
  render/              motion (GSAP presets), template (HTML/CSS), srt, preview
scripts/               doctor.ts (preflight) and models-check.ts (smoke test)
assets/audio/<slug>.mp3        narration (gitignored)
assets/images/<slug>/          images per case (gitignored)
assets/output/<slug>.srt/.mp4  subtitles + final video (gitignored)
renders/<slug>/        render workspace per case (gitignored)
tests/                 vitest: pure logic of each stage
docs/                  REFERENCIA, TAREAS, TROUBLESHOOTING, IMAGENES-IA,
                       caso-nan-community
```

The demo case (`caso-nan-community`) is the exception: its audio, images and video
are versioned on purpose so everyone can see the result.

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **FFmpeg + ffprobe** (`brew install ffmpeg` on macOS, `apt install ffmpeg` on Linux)
- **HyperFrames**: runs via `npx hyperframes` (no global install needed)
- **pre-commit** (`pip install pre-commit` or `brew install pre-commit`) → `pre-commit install`
  (only `gitleaks` is configured; lint and typecheck are run manually)
- Environment variables: copy `.env.example` to `.env` and fill in `NAN_BASE_URL` / `NAN_API_KEY`

## Getting started

```bash
yarn install
pre-commit install
cp .env.example .env          # fill in NAN_BASE_URL and NAN_API_KEY
yarn doctor                   # checks that everything is ready
yarn load caso-nan-community  # checks that the structure loads
```

> ⚠️ **No CI is configured** (GitHub Actions is blocked on the owner's account).
> Before a PR: run `yarn typecheck && yarn test` locally. See `docs/TROUBLESHOOTING.md`
> for known cluster issues (blind mimo, 3-request limit, User-Agent…).

## Commands

```bash
yarn produce "<topic>" [slug] [--skip-<stage>]  # full pipeline (orchestrator)
yarn script "<topic>" [slug] [scenes]  # 1. script → content/<slug>.yml
yarn vision <slug> [--force]           # 2. one image per scene → assets/images/<slug>/
yarn voice <slug>                      # 3. narration → assets/audio/<slug>.mp3
yarn subtitles <slug>                  # 4. CapCut-style SRT → assets/output/<slug>.srt
yarn compose <slug>                    # 5. render workspace → renders/<slug>/
yarn doctor                            # preflight: env + ffmpeg + hyperframes + API
yarn models:check                      # smoke test of each NaN model
yarn typecheck && yarn test            # local verification (no CI)
```

Stages accepted by `--skip-<stage>`: `script`, `vision`, `voice`, `subtitles`,
`compose`, `render`, `mux`. Without a slug, the orchestrator uses the most recent YAML
in `content/`; if `content/<slug>.yml` already exists, the script is used as is
(it is not regenerated).

## Use cases

A **case** is a short video defined by its storyboard (`content/<slug>.yml`, YAML data
you can edit by hand) plus the assets the pipeline generates for it (images, voice,
subtitles, render workspace, final MP4).

Full flow, stage by stage:

```bash
yarn script "<topic>" <slug> [scenes]  # 1. script (qwen3.6) → content/<slug>.yml
yarn vision <slug>                     # 2. 1 image per scene (gemma4) → assets/images/<slug>/
yarn voice <slug>                      # 3. narration (kokoro) → assets/audio/<slug>.mp3
yarn subtitles <slug>                  # 4. CapCut-style SRT (whisper) → assets/output/<slug>.srt
yarn compose <slug>                    # 5. render workspace → renders/<slug>/
yarn produce "<topic>" <slug>          # 1-7: adds render (HyperFrames) and mux (ffmpeg)
                                       #      → assets/output/<slug>.mp4
```

The intermediate result can be viewed **without a server or the cluster**: double-click
`renders/<slug>/preview.html` (audio + GSAP motion + synced captions). The `index.html`
in the same workspace is the frame source for HyperFrames; it has no audio on purpose
and is not a player.

Approximate timings (measured 2026-06-11):

| Stage | Typical duration | Cluster |
|---|---|---|
| script | ~30 s | 1-3 calls (retry with feedback) |
| vision | ~1.5-2.5 min | 1 query call + per scene: 1 embedding (pre-rank) and ~5 gemma4 evaluations |
| voice | ~5-15 s | 1 TTS call |
| subtitles | ~5 s to ~6 min | 1 transcription (whisper, variable) |
| compose | ~1-2 s | none (100% local) |

> ⚠️ Cluster limit: **at most 3 concurrent requests.** Within one process,
> `nan-call.ts` enforces it; across processes there is no coordination, so cases are
> run in at most **2 parallel lanes** (see
> [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)).

The repo's live case is **`caso-nan-community`**: the demo video that explains the NaN
community and the pipeline itself. Full sheet in
[`docs/caso-nan-community.md`](./docs/caso-nan-community.md); its images are generated
with external AI following [`docs/IMAGENES-IA.md`](./docs/IMAGENES-IA.md).

## Configuration

Two sources, with no overlap:

- **`config.yml`** (versioned): shared defaults — model names, default voice, providers
  and image mode. If the platform renames a model, you change it here.
- **`.env`** (secret, not versioned): credentials and optional overrides.

### Local image mode (`media.mode: local`)

To use images generated with external AI (no web search):

```bash
# In .env or config.yml:
MEDIA_MODE=local
MEDIA_PROVIDERS=local
```

Two ways to provide images (they can be combined):

1. **Per scene (deterministic):** `assets/images/<slug>/<scene-id>.jpg` is used as is.
2. **Descriptive pool:** `assets/images/_pool/numancia_hilltop-fog.jpg`: the file name
   becomes a query and is matched by similarity + gemma4.

> In both modes, if a scene's image already exists, **it is kept** (no search).
> To regenerate, delete it or run `yarn vision <slug> --force`.

| Variable (.env) | Required | Description |
|----------|----------|-------------|
| `NAN_BASE_URL` | ✅ | NaN cluster base URL (OpenAI-compatible API) |
| `NAN_API_KEY` | ✅ | Member authentication token (secret) |
| `NAN_VOICE_ID` | ❌ | Override for the kokoro voice (default in `config.yml`: `em_alex`) |
| `MEDIA_PROVIDERS` | ❌ | Override for providers, csv (default in `config.yml`: `wikimedia,local`) |
| `MEDIA_MODE` | ❌ | Override for the image mode, `auto`/`local` (default in `config.yml`: `auto`) |
| `PEXELS_API_KEY` | ❌ | Pexels API key (opt-in, secret) |

## Documentation

All the detail lives in [`docs/`](./docs/) (in Spanish):

| Document | What for |
|-----------|----------|
| [`docs/REFERENCIA.md`](./docs/REFERENCIA.md) | Full technical reference: stages, types, infrastructure (seed of the docs site) |
| [`docs/TAREAS.md`](./docs/TAREAS.md) | Work split: goals and definition of done per piece |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Cluster failures already found and how to fix them (blind mimo, User-Agent, pexels…) |
| [`docs/caso-nan-community.md`](./docs/caso-nan-community.md) | Sheet for the live case: the NaN community demo video |
| [`docs/IMAGENES-IA.md`](./docs/IMAGENES-IA.md) | How to generate the images with external AI (local mode) |

## Status

The pipeline is **complete end to end**: script → vision → voice → subtitles →
composition → render (HyperFrames) → mux (ffmpeg) produce the final MP4. The demo video
and the documentation site are live at https://lamjesus.github.io/nan-video-pipeline/.
Per-piece status lives in `docs/TAREAS.md`.

> The visual material comes from **public-domain archives selected by AI** or from
> **images generated elsewhere** (local mode): the cluster models understand images but
> do not generate them.

## Common issues

| Symptom | Likely cause | Fix |
|---------|----------------|----------|
| `vision`: 0 candidates / generic fallback | Weak search terms | Use `MEDIA_MODE=local` + a descriptive pool in `_pool/` |
| `vision`: same image in several scenes | Small pool / deduplication | Add more images to `_pool/` or use `--force` |
| `mimo-v2.5` hallucinates descriptions | Model is **blind** in the cluster | Use `gemma4` (config.yml → `visionEval`) |
| `Error: máxima 3 peticiones simultáneas` | Cluster limit | Run cases in **at most 2 parallel lanes** |
| `wikimedia` returns HTML, not an image | Missing `User-Agent` | Already handled in code; if it fails, check `docs/TROUBLESHOOTING.md` |
