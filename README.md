# Numberblocxgenerator

A fast, mobile-friendly fan-made Numberblocks generator. Build any Numberblock from 1 to infinity, see which math clubs it belongs to (prime, square, triangular, etc.), share via URL, save as PNG.

**Live:** https://numberblocxgenerator.com (planned)

> Fan-made tool. Numberblocks is © Alphablocks Ltd / BBC Studios. Not affiliated, endorsed, or sponsored by them.

## Stack

- Astro 4 static site
- Single React island for the generator
- Canvas 2D rendering with 5 progressive tiers
- TypeScript strict
- Tailwind CSS
- Vitest tests

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # vitest run
npm run build    # production build to dist/
```

## Architecture

```
src/
├── pages/        # 4 routes: /, /clubs, /faq, /about
├── layouts/      # Base.astro with footer disclaimer
├── components/   # React island: Generator + sub-components
├── lib/          # Pure-TS logic (colors, layout, bigmath, clubs, format, url-state, 5 tier renderers, dispatcher)
└── data/         # named-numbers manifest (character image availability)
```

### Rendering tiers

| N range          | Tier   | Strategy                                              |
|------------------|--------|-------------------------------------------------------|
| 1-30 (manifest)  | image  | Character PNG from `public/characters/{n}.png`        |
| 31-99            | tier2  | Self-drawn block array via Canvas + generic face      |
| 100-9999         | tier3  | Compressed grid + big-number label                    |
| 10K-1B           | tier4  | Abstract block + sub-grid texture + label             |
| > 1B / ∞         | tier5  | Starry-night background + DOM overlay label           |

Any tier renders in under ~80ms (no Scratch-style block-explosion lag).

### Clubs engine

8 number-property predicates: Even, Odd, Prime (Miller-Rabin deterministic to 64-bit), Square, Cube, Triangular, Power of 2, Multiple of 10. Marks "too big to verify" only above Number.MAX_SAFE_INTEGER.

## Deploy (Cloudflare Pages)

1. Connect this repo to a Cloudflare Pages project.
2. Build command: `npm run build`
3. Build output: `dist`
4. Node version: 20.x
5. Custom domain: `numberblocxgenerator.com` (DNS via Cloudflare Registrar)

## Asset note

`public/characters/` is intentionally empty in the repo. Character PNGs for N in 1-30 (and named big numbers) are added manually before launch. The renderer falls back to tier2 self-drawn blocks if an expected image is missing.

## License

Code: MIT. Visual references to Numberblocks remain property of their respective owners.
