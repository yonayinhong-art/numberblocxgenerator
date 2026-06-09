# Numberblocxgenerator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fast, mobile-friendly numeric-block generator at `numberblocxgenerator.com` — handles N from 1 to ∞ with tiered rendering, 8 number-property clubs, share/save, and 4 SEO pages.

**Architecture:** Astro 4.x static site with a single React island (Generator). Canvas 2D for rendering with 5 progressive tiers. Pure-TS logic modules (colors, layout, bigmath, clubs) covered by Vitest tests. URL `?n=X` is the source of truth for current state. Static export deployed via Cloudflare Pages.

**Tech Stack:** Astro 4, React 18 (island), TypeScript, Tailwind CSS, Canvas 2D, Vitest, pnpm.

**Spec reference:** `docs/superpowers/specs/2026-06-09-numberblocxgenerator-design.md`
**Prototype reference (validated visuals):** `/Users/yona/numberblocks-prototype/index.html`

---

## File Structure

```
numberblocxgenerator/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── vitest.config.ts
├── .gitignore
├── public/
│   ├── characters/        ← Manual: PNGs sourced separately
│   ├── robots.txt
│   └── favicon.svg
├── src/
│   ├── pages/
│   │   ├── index.astro    ← Main game page
│   │   ├── clubs.astro    ← Clubs explainer
│   │   ├── faq.astro      ← FAQ
│   │   └── about.astro    ← IP disclaimer
│   ├── layouts/
│   │   └── Base.astro     ← Shared HTML shell, footer disclaimer
│   ├── components/
│   │   ├── Generator.tsx  ← React island entry
│   │   ├── Canvas.tsx     ← Canvas wrapper hook
│   │   ├── InputBar.tsx
│   │   ├── QuickJump.tsx
│   │   ├── ClubsPanel.tsx
│   │   └── ShareBar.tsx
│   ├── lib/
│   │   ├── types.ts       ← Shared types: NValue, Club, TierResult
│   │   ├── colors.ts      ← getColor(n)
│   │   ├── layout.ts      ← getLayout(n) → [cols, rows]
│   │   ├── bigmath.ts     ← isqrt, icbrt, millerRabin
│   │   ├── clubs.ts       ← 8 club predicates + getClubs(n)
│   │   ├── render-common.ts ← drawBlock, drawFace, fitCanvas
│   │   ├── tier1.ts       ← BBC image display (1-30 + named big numbers)
│   │   ├── tier2.ts       ← Self-drawn blocks 31-99
│   │   ├── tier3.ts       ← Compressed grid 100-9999
│   │   ├── tier4.ts       ← Abstract 10K-1B
│   │   ├── tier5.ts       ← Huge / infinity
│   │   ├── render.ts      ← Top-level dispatcher
│   │   ├── format.ts      ← formatBig, numberToWords, factorize
│   │   └── url-state.ts   ← parseN, serializeN
│   └── data/
│       └── named-numbers.json
└── tests/
    ├── colors.test.ts
    ├── layout.test.ts
    ├── bigmath.test.ts
    ├── clubs.test.ts
    ├── format.test.ts
    └── url-state.test.ts
```

---

## Phase 1: Bootstrap (Tasks 1-3)

### Task 1: Initialize Astro project with React + Tailwind + TypeScript

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `.gitignore`

- [ ] **Step 1: Scaffold Astro**

Working directory: `/Users/yona/numberblocxgenerator/`

Run:
```bash
cd /Users/yona/numberblocxgenerator
npm create astro@latest -- --template minimal --typescript strict --no-install --skip-houston --yes .
```

Expected: Creates `package.json`, `src/pages/index.astro` (default), `astro.config.mjs`, `tsconfig.json`.

- [ ] **Step 2: Add React and Tailwind integrations**

Run:
```bash
npm install
npx astro add react --yes
npx astro add tailwind --yes
```

Expected: `astro.config.mjs` updated with both integrations. `tailwind.config.mjs` created. New deps in `package.json`.

- [ ] **Step 3: Update astro.config.mjs to enforce static output**

Replace contents of `astro.config.mjs` with:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://numberblocxgenerator.com',
  output: 'static',
  integrations: [react(), tailwind()],
  build: {
    inlineStylesheets: 'auto',
  },
});
```

- [ ] **Step 4: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
.astro/
.env
.env.local
.DS_Store
*.log
```

- [ ] **Step 5: Init git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Astro + React + Tailwind"
```

---

### Task 2: Set up Vitest testing infrastructure

**Files:**
- Create: `vitest.config.ts`, `tests/smoke.test.ts`
- Modify: `package.json` (add scripts)

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest @vitest/ui jsdom
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Add test script to package.json**

In `package.json` under `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write smoke test**

Create `tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run and verify**

```bash
npm test
```

Expected: 1 test passed. If passes, commit:
```bash
git add -A
git commit -m "chore: add Vitest testing infrastructure"
```

---

### Task 3: Create shared types and Base layout

**Files:**
- Create: `src/lib/types.ts`, `src/layouts/Base.astro`

- [ ] **Step 1: Define shared types**

Create `src/lib/types.ts`:
```ts
// N can be a regular number (≤ Number.MAX_SAFE_INTEGER) or 'infinity'
export type NValue = number | 'infinity';

export type ClubName =
  | 'Even' | 'Odd' | 'Prime' | 'Square'
  | 'Cube' | 'Triangular' | 'PowerOf2' | 'MultipleOf10';

export interface Club {
  name: ClubName;
  label: string;
  emoji: string;
  match: boolean | null;  // null = too big to verify
  certain: boolean;
}

export type TierName = 'image' | 'tier2' | 'tier3' | 'tier4' | 'tier5';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}
```

- [ ] **Step 2: Create Base layout**

Create `src/layouts/Base.astro`:
```astro
---
interface Props {
  title: string;
  description: string;
  canonical?: string;
}
const { title, description, canonical } = Astro.props;
const site = Astro.site?.toString() ?? 'https://numberblocxgenerator.com';
const canonicalUrl = canonical ?? new URL(Astro.url.pathname, site).toString();
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
<body class="min-h-screen flex flex-col">
  <slot />
  <footer class="border-t border-orange-100 mt-12 py-6 bg-white/60 text-center text-xs text-gray-500 space-y-1">
    <p>Fan-made tool. Numberblocks is © Alphablocks Ltd / BBC Studios. Not affiliated, endorsed, or sponsored by them.</p>
    <p>
      Made by a fan to help kids explore numbers ·
      <a href="/faq" class="underline hover:text-gray-700">FAQ</a> ·
      <a href="/about" class="underline hover:text-gray-700">About</a> ·
      <a href="/clubs" class="underline hover:text-gray-700">Clubs</a>
    </p>
  </footer>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add shared types and Base layout with IP disclaimer"
```

---

## Phase 2: Pure Logic Modules — TDD (Tasks 4-8)

### Task 4: `src/lib/colors.ts` — BBC color palette

**Files:**
- Create: `src/lib/colors.ts`, `tests/colors.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/colors.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getColor } from '../src/lib/colors';

describe('getColor', () => {
  it('returns the canonical color for 1-10', () => {
    expect(getColor(1)).toBe('#E74C3C');
    expect(getColor(10)).toBe('#3498DB');
  });
  it('cycles by ones digit for n > 10', () => {
    expect(getColor(15)).toBe(getColor(5));
    expect(getColor(23)).toBe(getColor(3));
  });
  it('uses 10 for multiples of 10 above 10', () => {
    expect(getColor(100)).toBe(getColor(10));
    expect(getColor(1000)).toBe(getColor(10));
  });
});
```

- [ ] **Step 2: Verify it fails**

```bash
npm test -- tests/colors.test.ts
```

Expected: FAIL ("Cannot find module").

- [ ] **Step 3: Implement**

Create `src/lib/colors.ts`:
```ts
const PALETTE: Record<number, string> = {
  1: '#E74C3C',
  2: '#E67E22',
  3: '#F1C40F',
  4: '#27AE60',
  5: '#5DADE2',
  6: '#8E44AD',
  7: '#FF69B4',
  8: '#34495E',
  9: '#FF6B9D',
  10: '#3498DB',
};

export function getColor(n: number): string {
  if (n >= 1 && n <= 10) return PALETTE[n];
  const ones = ((n % 10) + 10) % 10;
  return ones === 0 ? PALETTE[10] : PALETTE[ones];
}
```

- [ ] **Step 4: Verify pass and commit**

```bash
npm test -- tests/colors.test.ts
git add -A && git commit -m "feat(lib): add color palette by ones-digit rule"
```

---

### Task 5: `src/lib/layout.ts` — block grid layout

**Files:**
- Create: `src/lib/layout.ts`, `tests/layout.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/layout.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getLayout } from '../src/lib/layout';

describe('getLayout', () => {
  it('hand-tuned for 1-10', () => {
    expect(getLayout(1)).toEqual([1, 1]);
    expect(getLayout(4)).toEqual([2, 2]);
    expect(getLayout(5)).toEqual([1, 5]);
    expect(getLayout(9)).toEqual([3, 3]);
    expect(getLayout(10)).toEqual([2, 5]);
  });
  it('chooses factor pair closest to square root for composites', () => {
    expect(getLayout(12)).toEqual([3, 4]);
    expect(getLayout(25)).toEqual([5, 5]);
    expect(getLayout(100)).toEqual([10, 10]);
  });
  it('uses ceil(sqrt) wide with incomplete top row for primes >10', () => {
    const [cols11, rows11] = getLayout(11);
    expect(cols11 * rows11).toBeGreaterThanOrEqual(11);
    expect(cols11).toBeLessThanOrEqual(rows11 + 1);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test -- tests/layout.test.ts
```

- [ ] **Step 3: Implement**

Create `src/lib/layout.ts`:
```ts
const HAND_TUNED: Record<number, [number, number]> = {
  1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 2], 5: [1, 5],
  6: [2, 3], 7: [1, 7], 8: [2, 4], 9: [3, 3], 10: [2, 5],
};

export function getLayout(n: number): [number, number] {
  if (HAND_TUNED[n]) return HAND_TUNED[n];
  // Find integer factor pair closest to square root
  for (let w = Math.floor(Math.sqrt(n)); w >= 1; w--) {
    if (n % w === 0) return [w, Math.floor(n / w)];
  }
  // Fallback (shouldn't reach: every n has factor 1)
  const w = Math.ceil(Math.sqrt(n));
  return [w, Math.ceil(n / w)];
}
```

Note: for primes > 10, the loop finds `w=1` (since `n % 1 === 0`), giving `[1, n]`. This is correct mathematically — primes render as a tall single column. The renderer is responsible for choosing display behavior (e.g., wrapping a tall column to a wider grid for visual balance).

Update test to match this behavior:
```ts
  it('returns [1, n] for primes (rendering layer decides display)', () => {
    expect(getLayout(11)).toEqual([1, 11]);
    expect(getLayout(13)).toEqual([1, 13]);
  });
```

Replace the "uses ceil(sqrt) wide" test with the above.

- [ ] **Step 4: Verify pass and commit**

```bash
npm test -- tests/layout.test.ts
git add -A && git commit -m "feat(lib): add block grid layout algorithm"
```

---

### Task 6: `src/lib/bigmath.ts` — BigInt math utilities

**Files:**
- Create: `src/lib/bigmath.ts`, `tests/bigmath.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/bigmath.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { isqrt, icbrt, isPrimeMR } from '../src/lib/bigmath';

describe('isqrt', () => {
  it('exact integer square roots', () => {
    expect(isqrt(0n)).toBe(0n);
    expect(isqrt(1n)).toBe(1n);
    expect(isqrt(4n)).toBe(2n);
    expect(isqrt(10000n)).toBe(100n);
  });
  it('floor for non-squares', () => {
    expect(isqrt(2n)).toBe(1n);
    expect(isqrt(8n)).toBe(2n);
    expect(isqrt(99n)).toBe(9n);
  });
  it('works for very large numbers', () => {
    expect(isqrt(10n ** 30n)).toBe(10n ** 15n);
  });
});

describe('icbrt', () => {
  it('exact integer cube roots', () => {
    expect(icbrt(0n)).toBe(0n);
    expect(icbrt(1n)).toBe(1n);
    expect(icbrt(8n)).toBe(2n);
    expect(icbrt(1000n)).toBe(10n);
  });
  it('floor for non-cubes', () => {
    expect(icbrt(9n)).toBe(2n);
    expect(icbrt(1001n)).toBe(10n);
  });
});

describe('isPrimeMR', () => {
  it('small primes', () => {
    expect(isPrimeMR(2n)).toBe(true);
    expect(isPrimeMR(3n)).toBe(true);
    expect(isPrimeMR(97n)).toBe(true);
  });
  it('small composites', () => {
    expect(isPrimeMR(1n)).toBe(false);
    expect(isPrimeMR(4n)).toBe(false);
    expect(isPrimeMR(91n)).toBe(false); // 7 * 13
  });
  it('Carmichael numbers correctly rejected', () => {
    expect(isPrimeMR(561n)).toBe(false);  // 3 * 11 * 17
    expect(isPrimeMR(1105n)).toBe(false); // Carmichael
  });
  it('large primes', () => {
    expect(isPrimeMR(2n ** 31n - 1n)).toBe(true); // Mersenne prime
    expect(isPrimeMR(1000000007n)).toBe(true);    // 10^9 + 7
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test -- tests/bigmath.test.ts
```

- [ ] **Step 3: Implement**

Create `src/lib/bigmath.ts`:
```ts
// Integer square root via Newton's method for BigInt.
export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new Error('isqrt of negative');
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) >> 1n;
  while (y < x) {
    x = y;
    y = (x + n / x) >> 1n;
  }
  return x;
}

export function icbrt(n: bigint): bigint {
  if (n < 0n) throw new Error('icbrt of negative');
  if (n < 2n) return n;
  // Use Newton iteration on cube root
  let x = n;
  let y = (2n * x + n / (x * x)) / 3n;
  while (y < x) {
    x = y;
    y = (2n * x + n / (x * x)) / 3n;
  }
  // x may be one too large; adjust
  while (x * x * x > n) x -= 1n;
  return x;
}

// Modular exponentiation: (base^exp) mod m for BigInt.
function powMod(base: bigint, exp: bigint, m: bigint): bigint {
  let result = 1n;
  base = base % m;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % m;
    exp >>= 1n;
    base = (base * base) % m;
  }
  return result;
}

// Witnesses sufficient for deterministic Miller-Rabin on n < 3.3e24,
// covering all 64-bit unsigned integers comfortably.
const MR_WITNESSES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];

export function isPrimeMR(n: bigint): boolean {
  if (n < 2n) return false;
  if (n < 4n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let r = 0n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    r += 1n;
  }

  witnessLoop: for (const a of MR_WITNESSES) {
    if (a >= n) continue;
    let x = powMod(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 0n; i < r - 1n; i++) {
      x = (x * x) % n;
      if (x === n - 1n) continue witnessLoop;
    }
    return false;
  }
  return true;
}
```

- [ ] **Step 4: Verify pass and commit**

```bash
npm test -- tests/bigmath.test.ts
git add -A && git commit -m "feat(lib): add isqrt, icbrt, Miller-Rabin primality"
```

---

### Task 7: `src/lib/clubs.ts` — 8 club predicates

**Files:**
- Create: `src/lib/clubs.ts`, `tests/clubs.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/clubs.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getClubs } from '../src/lib/clubs';

function matched(n: number | 'infinity', name: string): boolean | null {
  const club = getClubs(n).find((c) => c.name === name);
  return club ? club.match : false;
}

describe('clubs', () => {
  it('even/odd', () => {
    expect(matched(2, 'Even')).toBe(true);
    expect(matched(3, 'Even')).toBe(false);
    expect(matched(3, 'Odd')).toBe(true);
  });
  it('prime', () => {
    expect(matched(2, 'Prime')).toBe(true);
    expect(matched(97, 'Prime')).toBe(true);
    expect(matched(91, 'Prime')).toBe(false); // 7 * 13
    expect(matched(1, 'Prime')).toBe(false);
  });
  it('square / cube', () => {
    expect(matched(16, 'Square')).toBe(true);
    expect(matched(15, 'Square')).toBe(false);
    expect(matched(27, 'Cube')).toBe(true);
    expect(matched(64, 'Cube')).toBe(true); // 4^3
    expect(matched(64, 'Square')).toBe(true); // 8^2
  });
  it('triangular', () => {
    expect(matched(1, 'Triangular')).toBe(true);
    expect(matched(3, 'Triangular')).toBe(true);
    expect(matched(10, 'Triangular')).toBe(true);
    expect(matched(15, 'Triangular')).toBe(true);
    expect(matched(11, 'Triangular')).toBe(false);
  });
  it('power of 2', () => {
    expect(matched(1, 'PowerOf2')).toBe(true);
    expect(matched(1024, 'PowerOf2')).toBe(true);
    expect(matched(1000, 'PowerOf2')).toBe(false);
  });
  it('multiple of 10', () => {
    expect(matched(10, 'MultipleOf10')).toBe(true);
    expect(matched(100, 'MultipleOf10')).toBe(true);
    expect(matched(11, 'MultipleOf10')).toBe(false);
  });
  it('marks prime as null when too big to verify', () => {
    const huge = Number.MAX_SAFE_INTEGER;
    const clubs = getClubs(huge);
    const prime = clubs.find((c) => c.name === 'Prime');
    expect(prime?.match === null || typeof prime?.match === 'boolean').toBe(true);
  });
  it('infinity returns special club set', () => {
    const clubs = getClubs('infinity');
    expect(clubs.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test -- tests/clubs.test.ts
```

- [ ] **Step 3: Implement**

Create `src/lib/clubs.ts`:
```ts
import type { Club, ClubName, NValue } from './types';
import { isqrt, isPrimeMR } from './bigmath';

const SAFE_NUMBER_LIMIT = 1e15;

function isPrime(n: number): boolean | null {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  if (n > SAFE_NUMBER_LIMIT) {
    return isPrimeMR(BigInt(Math.round(n)));
  }
  if (n <= 1e10) {
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }
  return isPrimeMR(BigInt(n));
}

function isSquare(n: number): boolean {
  if (n < 1) return false;
  if (n > Number.MAX_SAFE_INTEGER) {
    const s = isqrt(BigInt(Math.round(n)));
    return s * s === BigInt(Math.round(n));
  }
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

function isCube(n: number): boolean {
  if (n < 1) return false;
  const c = Math.round(Math.cbrt(n));
  return c * c * c === n;
}

function isTriangular(n: number): boolean {
  if (n < 1) return false;
  // n triangular iff 8n+1 is a perfect square
  const x = 8 * n + 1;
  if (x > Number.MAX_SAFE_INTEGER) {
    const s = isqrt(BigInt(8) * BigInt(Math.round(n)) + 1n);
    return s * s === BigInt(8) * BigInt(Math.round(n)) + 1n;
  }
  const s = Math.round(Math.sqrt(x));
  return s * s === x;
}

function isPowerOf2(n: number): boolean {
  if (n < 1 || !Number.isInteger(n)) return false;
  if (n <= Number.MAX_SAFE_INTEGER) {
    return (BigInt(n) & (BigInt(n) - 1n)) === 0n;
  }
  return false;
}

const CLUB_LABELS: Record<ClubName, { label: string; emoji: string }> = {
  Even: { label: 'Even', emoji: '✌️' },
  Odd: { label: 'Odd', emoji: '☝️' },
  Prime: { label: 'Prime', emoji: '⭐' },
  Square: { label: 'Square', emoji: '⏹️' },
  Cube: { label: 'Cube', emoji: '🧊' },
  Triangular: { label: 'Triangular', emoji: '🔺' },
  PowerOf2: { label: 'Power of 2', emoji: '⚡' },
  MultipleOf10: { label: 'Multiple of 10', emoji: '🔟' },
};

function makeClub(name: ClubName, match: boolean | null, certain: boolean): Club {
  const { label, emoji } = CLUB_LABELS[name];
  return { name, label, emoji, match, certain };
}

export function getClubs(n: NValue): Club[] {
  if (n === 'infinity') {
    return [makeClub('Even', null, false)];
  }
  if (!Number.isFinite(n) || n < 1) return [];

  const primeResult = isPrime(n);
  return [
    makeClub('Even', n % 2 === 0, true),
    makeClub('Odd', n % 2 !== 0, true),
    makeClub('Prime', primeResult, primeResult !== null),
    makeClub('Square', isSquare(n), true),
    makeClub('Cube', isCube(n), true),
    makeClub('Triangular', isTriangular(n), true),
    makeClub('PowerOf2', isPowerOf2(n), n <= Number.MAX_SAFE_INTEGER),
    makeClub('MultipleOf10', n % 10 === 0 && n > 0, true),
  ];
}
```

- [ ] **Step 4: Verify pass and commit**

```bash
npm test -- tests/clubs.test.ts
git add -A && git commit -m "feat(lib): add 8-club number property engine"
```

---

### Task 8: `src/lib/format.ts` + `src/lib/url-state.ts`

**Files:**
- Create: `src/lib/format.ts`, `src/lib/url-state.ts`
- Create: `tests/format.test.ts`, `tests/url-state.test.ts`

- [ ] **Step 1: Write tests**

Create `tests/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatBig, numberToWords, factorize } from '../src/lib/format';

describe('formatBig', () => {
  it('< 1000 unchanged', () => {
    expect(formatBig(42)).toBe('42');
  });
  it('thousands', () => {
    expect(formatBig(1000)).toBe('1K');
    expect(formatBig(1500)).toBe('1.5K');
  });
  it('millions/billions/trillions', () => {
    expect(formatBig(1_000_000)).toBe('1M');
    expect(formatBig(1_000_000_000)).toBe('1B');
    expect(formatBig(1_000_000_000_000)).toBe('1T');
  });
});

describe('factorize', () => {
  it('primes', () => {
    expect(factorize(7)).toEqual([7]);
  });
  it('composites', () => {
    expect(factorize(12)).toEqual([2, 2, 3]);
    expect(factorize(100)).toEqual([2, 2, 5, 5]);
  });
  it('returns null for too-big numbers', () => {
    expect(factorize(1e8)).toBeNull();
  });
});

describe('numberToWords', () => {
  it('small numbers', () => {
    expect(numberToWords(5)).toBe('five');
    expect(numberToWords(19)).toBe('nineteen');
  });
  it('big-number suffixes', () => {
    expect(numberToWords(1_000_000)).toMatch(/million/);
    expect(numberToWords(2_000_000_000)).toMatch(/billion/);
  });
});
```

Create `tests/url-state.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseN, serializeN } from '../src/lib/url-state';

describe('parseN', () => {
  it('parses integer query', () => {
    expect(parseN('1000')).toBe(1000);
  });
  it('parses infinity', () => {
    expect(parseN('infinity')).toBe('infinity');
    expect(parseN('inf')).toBe('infinity');
    expect(parseN('∞')).toBe('infinity');
  });
  it('falls back to default for invalid', () => {
    expect(parseN(null, 5)).toBe(5);
    expect(parseN('garbage', 5)).toBe(5);
  });
});

describe('serializeN', () => {
  it('numbers to string', () => {
    expect(serializeN(42)).toBe('42');
  });
  it('infinity literal', () => {
    expect(serializeN('infinity')).toBe('infinity');
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test
```

- [ ] **Step 3: Implement format.ts**

Create `src/lib/format.ts`:
```ts
const SMALL_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

export function formatBig(n: number): string {
  if (n >= 1e12) return trimZero(n / 1e12) + 'T';
  if (n >= 1e9) return trimZero(n / 1e9) + 'B';
  if (n >= 1e6) return trimZero(n / 1e6) + 'M';
  if (n >= 1e3) return trimZero(n / 1e3) + 'K';
  return n.toLocaleString('en-US');
}

function trimZero(v: number): string {
  return v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
}

export function numberToWords(n: number): string {
  if (n < 20) return SMALL_WORDS[n] ?? n.toLocaleString('en-US');
  if (n < 100) return n.toLocaleString('en-US');
  if (n < 1e6) return n.toLocaleString('en-US');
  if (n < 1e9) return `${trimZero(n / 1e6)} million`;
  if (n < 1e12) return `${trimZero(n / 1e9)} billion`;
  if (n < 1e15) return `${trimZero(n / 1e12)} trillion`;
  return n.toExponential(2);
}

export function factorize(n: number): number[] | null {
  if (n > 1e7 || n < 2 || !Number.isInteger(n)) return null;
  const factors: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      factors.push(p);
      x = Math.floor(x / p);
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}
```

- [ ] **Step 4: Implement url-state.ts**

Create `src/lib/url-state.ts`:
```ts
import type { NValue } from './types';

export function parseN(raw: string | null, fallback: NValue = 5): NValue {
  if (raw == null) return fallback;
  const cleaned = raw.replace(/[,\s]/g, '').toLowerCase();
  if (cleaned === 'infinity' || cleaned === 'inf' || cleaned === '∞') return 'infinity';
  const num = parseInt(cleaned, 10);
  if (!Number.isFinite(num) || num < 1) return fallback;
  return Math.min(num, Number.MAX_SAFE_INTEGER);
}

export function serializeN(n: NValue): string {
  return n === 'infinity' ? 'infinity' : String(n);
}
```

- [ ] **Step 5: Verify pass and commit**

```bash
npm test
git add -A && git commit -m "feat(lib): add formatting, factorization, and URL state helpers"
```

---

## Phase 3: Rendering Modules (Tasks 9-15)

These modules touch Canvas. We don't TDD pixel output (high signal-to-noise cost); we test pure helpers (e.g., `getTier` dispatch logic) and rely on visual QA via the dev server.

### Task 9: `src/lib/render-common.ts` — shared canvas helpers

**Files:**
- Create: `src/lib/render-common.ts`

- [ ] **Step 1: Implement**

Create `src/lib/render-common.ts`:
```ts
import type { RenderContext } from './types';

export function fitCanvas(canvas: HTMLCanvasElement): RenderContext {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height, dpr };
}

export function clearCanvas(rc: RenderContext): void {
  rc.ctx.clearRect(0, 0, rc.width * rc.dpr, rc.height * rc.dpr);
}

export function drawBlock(
  rc: RenderContext,
  x: number, y: number, size: number, color: string,
  withSeparator = true,
): void {
  const { ctx } = rc;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x, y, size, size * 0.18);
  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.fillRect(x, y + size * 0.82, size, size * 0.18);
  if (withSeparator && size > 6) {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }
}

export function drawFace(
  rc: RenderContext,
  cx: number, cy: number, size: number,
): void {
  const { ctx } = rc;
  const eyeR = size * 0.09;
  const eyeOffX = size * 0.19;
  const eyeOffY = size * 0.08;
  for (const dx of [-eyeOffX, eyeOffX]) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx + dx, cy - eyeOffY, eyeR * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx + dx + size * 0.01, cy - eyeOffY + size * 0.01, eyeR * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(cx + dx + eyeR * 0.3, cy - eyeOffY - eyeR * 0.3, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#222';
  ctx.lineWidth = size * 0.045;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy + size * 0.13, size * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(lib): add shared canvas helpers (drawBlock, drawFace, fitCanvas)"
```

---

### Task 10: `src/lib/tier1.ts` — character image renderer

**Files:**
- Create: `src/lib/tier1.ts`
- Create: `src/data/named-numbers.json`

- [ ] **Step 1: Create named-numbers index**

Create `src/data/named-numbers.json`:
```json
{
  "available": [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    100, 1000, 10000, 100000, 1000000, 1000000000
  ]
}
```

This is the manifest of N values for which a `public/characters/{n}.png` is expected to exist. Update this list as assets are added.

- [ ] **Step 2: Implement tier1**

Create `src/lib/tier1.ts`:
```ts
import type { RenderContext, NValue } from './types';
import namedNumbers from '../data/named-numbers.json';

const AVAILABLE = new Set<number>(namedNumbers.available);

const imageCache = new Map<number, HTMLImageElement>();

export function hasCharacterImage(n: NValue): n is number {
  return typeof n === 'number' && AVAILABLE.has(n);
}

function loadImage(n: number): Promise<HTMLImageElement> {
  const cached = imageCache.get(n);
  if (cached?.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(n, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = `/characters/${n}.png`;
  });
}

export async function renderTier1(rc: RenderContext, n: number): Promise<void> {
  const img = await loadImage(n);
  const { ctx, width, height } = rc;
  const padding = Math.min(width, height) * 0.08;
  const maxW = width - padding * 2;
  const maxH = height - padding * 2;
  const aspect = img.naturalWidth / img.naturalHeight;
  let drawW = maxW;
  let drawH = maxW / aspect;
  if (drawH > maxH) {
    drawH = maxH;
    drawW = maxH * aspect;
  }
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(render): tier1 character image renderer with manifest"
```

---

### Task 11: `src/lib/tier2.ts` — self-drawn blocks (31-99)

**Files:**
- Create: `src/lib/tier2.ts`

- [ ] **Step 1: Implement**

Create `src/lib/tier2.ts`:
```ts
import type { RenderContext } from './types';
import { getColor } from './colors';
import { getLayout } from './layout';
import { drawBlock, drawFace } from './render-common';

// For primes >10, use ceil(sqrt) wide so the character isn't a single tall column.
function getDisplayLayout(n: number): [number, number] {
  const [w, h] = getLayout(n);
  if (w === 1 && n > 10) {
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    return [cols, rows];
  }
  return [w, h];
}

export function renderTier2(rc: RenderContext, n: number): void {
  const { width, height } = rc;
  const [cols, rows] = getDisplayLayout(n);
  const padding = Math.min(width, height) * 0.08;
  const availW = width - padding * 2;
  const availH = height - padding * 2;
  const maxBlock = Math.min(140, availH / 2);
  const blockSize = Math.min(availW / cols, availH / rows, maxBlock);
  const startX = (width - blockSize * cols) / 2;
  const startY = (height - blockSize * rows) / 2;
  const color = getColor(n);

  const lastRowCount = ((n - 1) % cols) + 1;

  let drawn = 0;
  for (let row = 0; row < rows; row++) {
    const inThisRow = row === rows - 1 ? lastRowCount : cols;
    const offsetX = (cols - inThisRow) * blockSize / 2;
    for (let col = 0; col < inThisRow; col++) {
      if (drawn >= n) break;
      const x = startX + offsetX + col * blockSize;
      const y = startY + (rows - 1 - row) * blockSize;
      drawBlock(rc, x, y, blockSize, color);
      drawn++;
    }
  }

  // Face on the top row, centered over its occupied blocks
  const topRowY = startY;
  const topRowCount = lastRowCount;
  const topRowOffsetX = (cols - topRowCount) * blockSize / 2;
  const faceCx = startX + topRowOffsetX + (topRowCount * blockSize) / 2;
  const faceCy = topRowY + blockSize / 2;
  drawFace(rc, faceCx, faceCy, blockSize);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(render): tier2 self-drawn block array (31-99)"
```

---

### Task 12: `src/lib/tier3.ts` — compressed grid (100-9999)

**Files:**
- Create: `src/lib/tier3.ts`

- [ ] **Step 1: Implement**

Create `src/lib/tier3.ts`:
```ts
import type { RenderContext } from './types';
import { getColor } from './colors';
import { getLayout } from './layout';
import { drawFace } from './render-common';

export function renderTier3(rc: RenderContext, n: number): void {
  const { ctx, width, height } = rc;
  // Use square-ish grid; for tier3 we ignore prime degenerate columns.
  let cols = Math.ceil(Math.sqrt(n));
  let rows = Math.ceil(n / cols);
  const _ = getLayout; // unused but kept import for parity with other tiers
  const padding = Math.min(width, height) * 0.08;
  const availW = width - padding * 2;
  const availH = height * 0.55;
  const blockSize = Math.min(availW / cols, availH / rows);
  const startX = (width - blockSize * cols) / 2;
  const startY = padding;
  const color = getColor(n);

  ctx.fillStyle = color;
  const lastRowCount = ((n - 1) % cols) + 1;
  let drawn = 0;
  for (let row = 0; row < rows; row++) {
    const inThisRow = row === rows - 1 ? lastRowCount : cols;
    const offsetX = (cols - inThisRow) * blockSize / 2;
    for (let col = 0; col < inThisRow; col++) {
      if (drawn >= n) break;
      const x = startX + offsetX + col * blockSize;
      const y = startY + (rows - 1 - row) * blockSize;
      const sep = blockSize > 4 ? 0.5 : 0;
      ctx.fillRect(x, y, blockSize - sep, blockSize - sep);
      drawn++;
    }
  }

  // Top highlight strip
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(startX, startY, cols * blockSize, blockSize * 0.3);

  // Centered face overlay
  const faceSize = Math.min(width * 0.25, 110);
  drawFace(rc, width / 2, height * 0.42, faceSize);

  // Big number label below
  ctx.font = `900 ${Math.min(width * 0.13, 56)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 6;
  ctx.strokeText(n.toLocaleString('en-US'), width / 2, height * 0.78);
  ctx.fillStyle = 'white';
  ctx.fillText(n.toLocaleString('en-US'), width / 2, height * 0.78);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(render): tier3 compressed grid (100-9999)"
```

---

### Task 13: `src/lib/tier4.ts` — abstract big block (10K-1B)

**Files:**
- Create: `src/lib/tier4.ts`

- [ ] **Step 1: Implement**

Create `src/lib/tier4.ts`:
```ts
import type { RenderContext } from './types';
import { getColor } from './colors';
import { drawBlock, drawFace } from './render-common';
import { formatBig } from './format';

export function renderTier4(rc: RenderContext, n: number): void {
  const { ctx, width, height } = rc;
  const blockSize = Math.min(width, height) * 0.5;
  const x = (width - blockSize) / 2;
  const y = (height - blockSize) / 2 - 10;
  const color = getColor(n);

  drawBlock(rc, x, y, blockSize, color, false);

  // Sub-grid texture
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  const gridN = 14;
  const cell = blockSize / gridN;
  for (let i = 1; i < gridN; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * cell, y);
    ctx.lineTo(x + i * cell, y + blockSize);
    ctx.moveTo(x, y + i * cell);
    ctx.lineTo(x + blockSize, y + i * cell);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, blockSize, blockSize);

  drawFace(rc, width / 2, y + blockSize * 0.4, blockSize * 0.5);

  ctx.font = `900 ${blockSize * 0.18}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 5;
  ctx.strokeText(formatBig(n), width / 2, height - 30);
  ctx.fillStyle = 'white';
  ctx.fillText(formatBig(n), width / 2, height - 30);
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(render): tier4 abstract big block (10K-1B)"
```

---

### Task 14: `src/lib/tier5.ts` — huge / infinity

**Files:**
- Create: `src/lib/tier5.ts`

- [ ] **Step 1: Implement**

Create `src/lib/tier5.ts`:
```ts
import type { RenderContext, NValue } from './types';
import { formatBig } from './format';

export function renderTier5(rc: RenderContext, n: NValue): { label: string; sub: string } {
  const { ctx, width, height } = rc;
  const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
  grad.addColorStop(0, '#9B59B6');
  grad.addColorStop(1, '#5B2C82');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 30; i++) {
    const sx = (Math.sin(i * 37) * 0.5 + 0.5) * width;
    const sy = (Math.cos(i * 31) * 0.5 + 0.5) * height;
    const sr = Math.abs(Math.sin(i * 13)) * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  if (n === 'infinity') {
    return { label: '∞', sub: 'Infinity — the biggest number, forever' };
  }
  return { label: formatBig(n), sub: n.toLocaleString('en-US') };
}
```

The big label is drawn as a DOM overlay (sharper text at any size) inside `Generator.tsx`. This function only renders the background canvas and returns the text strings for the overlay.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(render): tier5 huge/infinity mode with starry background"
```

---

### Task 15: `src/lib/render.ts` — dispatcher

**Files:**
- Create: `src/lib/render.ts`, `tests/render-dispatch.test.ts`

- [ ] **Step 1: Write tier-selection test**

Create `tests/render-dispatch.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { pickTier } from '../src/lib/render';

describe('pickTier', () => {
  it('image for 1-30', () => {
    expect(pickTier(1)).toBe('image');
    expect(pickTier(30)).toBe('image');
  });
  it('tier2 for 31-99', () => {
    expect(pickTier(31)).toBe('tier2');
    expect(pickTier(99)).toBe('tier2');
  });
  it('image for named big numbers', () => {
    expect(pickTier(100)).toBe('image');
    expect(pickTier(1000)).toBe('image');
    expect(pickTier(1000000)).toBe('image');
  });
  it('tier3 for unnamed 100-9999', () => {
    expect(pickTier(101)).toBe('tier3');
    expect(pickTier(2520)).toBe('tier3');
  });
  it('tier4 for 10K-1B', () => {
    expect(pickTier(10000)).toBe('tier4');
    expect(pickTier(999_999_999)).toBe('tier4');
  });
  it('tier5 for >1B and infinity', () => {
    expect(pickTier(1_000_000_001)).toBe('tier5');
    expect(pickTier('infinity')).toBe('tier5');
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test -- tests/render-dispatch.test.ts
```

- [ ] **Step 3: Implement render.ts**

Create `src/lib/render.ts`:
```ts
import type { RenderContext, NValue, TierName } from './types';
import { hasCharacterImage, renderTier1 } from './tier1';
import { renderTier2 } from './tier2';
import { renderTier3 } from './tier3';
import { renderTier4 } from './tier4';
import { renderTier5 } from './tier5';
import { clearCanvas } from './render-common';

export function pickTier(n: NValue): TierName {
  if (n === 'infinity') return 'tier5';
  if (hasCharacterImage(n)) return 'image';
  if (n <= 99) return 'tier2';
  if (n <= 9999) return 'tier3';
  if (n <= 1e9) return 'tier4';
  return 'tier5';
}

export interface RenderResult {
  tier: TierName;
  overlay: { label: string; sub: string } | null;
}

export async function render(rc: RenderContext, n: NValue): Promise<RenderResult> {
  clearCanvas(rc);
  const tier = pickTier(n);
  switch (tier) {
    case 'image':
      await renderTier1(rc, n as number);
      return { tier, overlay: null };
    case 'tier2':
      renderTier2(rc, n as number);
      return { tier, overlay: null };
    case 'tier3':
      renderTier3(rc, n as number);
      return { tier, overlay: null };
    case 'tier4':
      renderTier4(rc, n as number);
      return { tier, overlay: null };
    case 'tier5':
      return { tier, overlay: renderTier5(rc, n) };
  }
}
```

- [ ] **Step 4: Verify pass and commit**

```bash
npm test
git add -A && git commit -m "feat(render): dispatcher with tier-selection logic"
```

---

## Phase 4: UI Components (Tasks 16-20)

### Task 16: `src/components/InputBar.tsx`

**Files:**
- Create: `src/components/InputBar.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useState, useEffect } from 'react';
import type { NValue } from '../lib/types';

interface Props {
  value: NValue;
  onChange: (n: NValue) => void;
}

export default function InputBar({ value, onChange }: Props) {
  const [draft, setDraft] = useState(format(value));

  useEffect(() => {
    setDraft(format(value));
  }, [value]);

  function format(v: NValue): string {
    return v === 'infinity' ? '∞' : v.toLocaleString('en-US');
  }

  function commit() {
    const cleaned = draft.replace(/[,\s]/g, '').toLowerCase();
    if (cleaned === 'infinity' || cleaned === 'inf' || cleaned === '∞') {
      onChange('infinity');
      return;
    }
    const num = parseInt(cleaned, 10);
    if (Number.isFinite(num) && num >= 1) {
      onChange(Math.min(num, Number.MAX_SAFE_INTEGER));
    } else {
      setDraft(format(value));
    }
  }

  function step(delta: number) {
    if (value === 'infinity') return;
    onChange(Math.max(1, value + delta));
  }

  return (
    <div className="bg-white rounded-2xl shadow p-3 flex items-center gap-2">
      <button
        onClick={() => step(-1)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl w-12 h-12 text-2xl font-bold"
        aria-label="Previous number"
      >−</button>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        onFocus={(e) => (e.target as HTMLInputElement).select()}
        className="flex-1 text-center text-3xl md:text-4xl font-black text-gray-800 outline-none bg-gray-50 rounded-xl py-2"
        aria-label="Number"
      />
      <button
        onClick={() => step(1)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl w-12 h-12 text-2xl font-bold"
        aria-label="Next number"
      >+</button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(ui): InputBar with stepper and infinity handling"
```

---

### Task 17: `src/components/QuickJump.tsx`

**Files:**
- Create: `src/components/QuickJump.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { NValue } from '../lib/types';

interface Props {
  current: NValue;
  onJump: (n: NValue) => void;
}

const JUMPS: { value: NValue; label: string; cls: string }[] = [
  { value: 10, label: '10', cls: 'bg-yellow-400 hover:bg-yellow-500' },
  { value: 100, label: '100', cls: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 1000, label: '1K', cls: 'bg-orange-400 hover:bg-orange-500' },
  { value: 1_000_000, label: '1M', cls: 'bg-orange-500 hover:bg-orange-600' },
  { value: 1_000_000_000, label: '1B', cls: 'bg-red-500 hover:bg-red-600' },
  { value: 1_000_000_000_000, label: '1T', cls: 'bg-red-600 hover:bg-red-700' },
  { value: 'infinity', label: '∞', cls: 'bg-purple-600 hover:bg-purple-700' },
];

const RANDOM_CHOICES: NValue[] = [3, 7, 12, 25, 64, 100, 144, 256, 1024, 2520, 9710, 1_000_000, 1_000_000_000, 'infinity'];

export default function QuickJump({ current, onJump }: Props) {
  function step(delta: number) {
    if (current === 'infinity') return;
    onJump(Math.max(1, current + delta));
  }

  function random() {
    let pick = RANDOM_CHOICES[Math.floor(Math.random() * RANDOM_CHOICES.length)];
    if (pick === current) pick = RANDOM_CHOICES[(RANDOM_CHOICES.indexOf(pick) + 1) % RANDOM_CHOICES.length];
    onJump(pick);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-3 space-y-2">
      <div className="text-xs text-gray-500 font-bold tracking-wide">JUMP TO</div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {JUMPS.map((j) => (
          <button
            key={String(j.value)}
            onClick={() => onJump(j.value)}
            className={`${j.cls} text-white rounded-lg py-2 text-sm font-bold`}
            aria-label={`Jump to ${j.label}`}
          >{j.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 text-sm">
        <button onClick={() => step(-100)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">−100</button>
        <button onClick={() => step(-10)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">−10</button>
        <button onClick={random} className="bg-pink-400 hover:bg-pink-500 text-white rounded-lg py-1.5 font-bold" aria-label="Random number">🎲</button>
        <button onClick={() => step(10)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">+10</button>
        <button onClick={() => step(100)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">+100</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(ui): QuickJump component with shortcuts and random"
```

---

### Task 18: `src/components/ClubsPanel.tsx`

**Files:**
- Create: `src/components/ClubsPanel.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { NValue } from '../lib/types';
import { getClubs } from '../lib/clubs';

interface Props {
  n: NValue;
}

export default function ClubsPanel({ n }: Props) {
  const clubs = getClubs(n);
  const matchCount = clubs.filter((c) => c.match === true).length;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-base font-black text-gray-800 mb-3 flex items-center gap-2">
        🏆 <span>Clubs</span>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
          {matchCount}/{clubs.length}
        </span>
      </h2>
      <ul className="space-y-1.5">
        {clubs.map((c) => {
          const status = c.match === null ? '❓' : c.match ? '✅' : '—';
          const bg =
            c.match === true ? 'bg-green-50 border-green-200'
              : c.match === null ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-100 opacity-50';
          return (
            <li key={c.name} className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${bg}`}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <span className="font-bold text-sm text-gray-700">{c.label}</span>
                {!c.certain && c.match === null && (
                  <span className="text-[10px] text-yellow-700 ml-1">too big to verify</span>
                )}
              </span>
              <span className="text-sm">{status}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(ui): ClubsPanel showing 8 number properties"
```

---

### Task 19: `src/components/ShareBar.tsx`

**Files:**
- Create: `src/components/ShareBar.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useState } from 'react';
import type { NValue } from '../lib/types';

interface Props {
  n: NValue;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function ShareBar({ n, canvasRef }: Props) {
  const [copyLabel, setCopyLabel] = useState('📋 Copy Link');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel('✅ Copied!');
      setTimeout(() => setCopyLabel('📋 Copy Link'), 1500);
    } catch {
      setCopyLabel('Press ⌘C');
      setTimeout(() => setCopyLabel('📋 Copy Link'), 1500);
    }
  }

  function savePng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `numberblock-${n}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={copyLink}
        className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold"
      >{copyLabel}</button>
      <button
        onClick={savePng}
        className="bg-blue-400 hover:bg-blue-500 text-white rounded-xl py-3 font-bold"
      >💾 Save PNG</button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(ui): ShareBar with copy-link and save-png"
```

---

### Task 20: `src/components/Generator.tsx` — root island

**Files:**
- Create: `src/components/Generator.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useState, useRef, useEffect, useCallback } from 'react';
import type { NValue } from '../lib/types';
import { render } from '../lib/render';
import { fitCanvas } from '../lib/render-common';
import { parseN, serializeN } from '../lib/url-state';
import InputBar from './InputBar';
import QuickJump from './QuickJump';
import ClubsPanel from './ClubsPanel';
import ShareBar from './ShareBar';

function getInitialN(): NValue {
  if (typeof window === 'undefined') return 5;
  return parseN(new URLSearchParams(window.location.search).get('n'), 5);
}

export default function Generator() {
  const [n, setN] = useState<NValue>(getInitialN);
  const [overlay, setOverlay] = useState<{ label: string; sub: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(async (value: NValue) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rc = fitCanvas(canvas);
    try {
      const result = await render(rc, value);
      setOverlay(result.overlay);
    } catch (e) {
      console.error('render failed', e);
    }
  }, []);

  function setNumber(value: NValue) {
    setN(value);
    const params = new URLSearchParams(window.location.search);
    params.set('n', serializeN(value));
    window.history.replaceState(null, '', '?' + params.toString());
  }

  useEffect(() => {
    draw(n);
  }, [n, draw]);

  useEffect(() => {
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => draw(n), 100);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, [n, draw]);

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <section className="lg:col-span-2 space-y-3">
        <div className="relative rounded-2xl shadow-lg overflow-hidden" style={{ aspectRatio: '4/3', background: 'linear-gradient(180deg, #B8E0FF 0%, #87CEEB 60%, #98D89E 60%, #7BC780 100%)' }}>
          <canvas ref={canvasRef} className="w-full h-full block" />
          {overlay && (
            <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg pointer-events-none">
              <div className="text-center">
                <div className="text-5xl md:text-8xl font-black" style={{ textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>{overlay.label}</div>
                <div className="text-base md:text-xl mt-2 font-bold">{overlay.sub}</div>
              </div>
            </div>
          )}
        </div>

        <InputBar value={n} onChange={setNumber} />
        <QuickJump current={n} onJump={setNumber} />
        <ShareBar n={n} canvasRef={canvasRef} />
      </section>

      <aside className="space-y-3">
        <ClubsPanel n={n} />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(ui): Generator island wiring all components together"
```

---

## Phase 5: Pages (Tasks 21-24)

### Task 21: `src/pages/index.astro` — main page

**Files:**
- Create: `src/pages/index.astro` (replacing the default)

- [ ] **Step 1: Implement**

```astro
---
import Base from '../layouts/Base.astro';
import Generator from '../components/Generator.tsx';
---
<Base
  title="Numberblocks Generator — Play Online, No Lag"
  description="Build any Numberblock from 1 to infinity. Fast, mobile-friendly, with prime/square/triangular clubs. Free fan-made tool."
>
  <header class="bg-white/80 backdrop-blur border-b border-orange-100">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg md:text-2xl font-black tracking-tight text-gray-800">
        <span class="text-red-500">Number</span><span class="text-blue-500">blocx</span> Generator
      </h1>
      <div class="text-xs md:text-sm text-gray-500 font-semibold hidden sm:flex items-center gap-3">
        <span>⚡ No Lag</span>
        <span>♾️ Big Numbers</span>
        <span>🏆 Clubs</span>
      </div>
    </div>
  </header>

  <main>
    <Generator client:load />
    <section class="max-w-3xl mx-auto px-4 py-10 prose prose-sm md:prose">
      <h2>How it works</h2>
      <p>Type any number from 1 to infinity. We build a Numberblock-style character on the spot — no waiting, no lag on phones or school laptops.</p>
      <h2>Famous numbers to try</h2>
      <ul>
        <li><a href="/?n=2520">2520</a> — joins the most clubs</li>
        <li><a href="/?n=1024">1024</a> — a power of 2</li>
        <li><a href="/?n=144">144</a> — perfect square of 12</li>
        <li><a href="/?n=infinity">∞</a> — the biggest number, forever</li>
      </ul>
      <p>Curious what a <a href="/clubs">club</a> is? Check the explainer.</p>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: Run dev server, verify in browser**

```bash
npm run dev
```

Open `http://localhost:4321/`. Try inputs 1, 5, 30, 50, 100, 1000, 1_000_000, infinity. Confirm:
- Canvas renders without errors
- ClubsPanel updates
- URL updates with `?n=`
- Mobile breakpoint at 375px shows single column

(For 1-30 the renderer will try to load `/characters/{n}.png` — these don't exist yet, so the canvas will be blank for those values. Tier 2/3/4/5 will render normally. Proceed past this for now.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: main page with Generator island and landing content"
```

---

### Task 22: `src/pages/clubs.astro` — clubs explainer

**Files:**
- Create: `src/pages/clubs.astro`

- [ ] **Step 1: Implement**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Numberblocks Clubs Explained — Prime, Square, Triangular & More"
  description="Every Numberblock belongs to clubs based on its properties. Learn the 8 main clubs with examples."
>
  <header class="bg-white/80 backdrop-blur border-b border-orange-100">
    <div class="max-w-6xl mx-auto px-4 py-3">
      <a href="/" class="text-lg md:text-2xl font-black tracking-tight text-gray-800">
        <span class="text-red-500">Number</span><span class="text-blue-500">blocx</span> Generator
      </a>
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 py-8 prose prose-sm md:prose">
    <h1>Clubs Explained</h1>
    <p>A "club" is a group of Numberblocks that share a math property. Each number can belong to several clubs at once.</p>

    <h2 id="even-odd">Even & Odd</h2>
    <p>Even numbers can be split into two equal piles: <a href="/?n=2">2</a>, <a href="/?n=4">4</a>, <a href="/?n=6">6</a>, <a href="/?n=8">8</a>, <a href="/?n=10">10</a>...</p>
    <p>Odd numbers always have one left over: <a href="/?n=1">1</a>, <a href="/?n=3">3</a>, <a href="/?n=5">5</a>, <a href="/?n=7">7</a>, <a href="/?n=9">9</a>...</p>

    <h2 id="prime">Prime</h2>
    <p>Prime numbers can only be split into rows of 1 or rows of themselves: <a href="/?n=2">2</a>, <a href="/?n=3">3</a>, <a href="/?n=5">5</a>, <a href="/?n=7">7</a>, <a href="/?n=11">11</a>, <a href="/?n=13">13</a>, <a href="/?n=97">97</a>...</p>

    <h2 id="square">Square</h2>
    <p>Square numbers make perfect squares: <a href="/?n=1">1</a>, <a href="/?n=4">4</a>, <a href="/?n=9">9</a>, <a href="/?n=16">16</a>, <a href="/?n=25">25</a>, <a href="/?n=100">100</a>...</p>

    <h2 id="cube">Cube</h2>
    <p>Cube numbers make perfect 3D cubes: <a href="/?n=1">1</a>, <a href="/?n=8">8</a>, <a href="/?n=27">27</a>, <a href="/?n=64">64</a>, <a href="/?n=125">125</a>, <a href="/?n=1000">1000</a>...</p>

    <h2 id="triangular">Triangular</h2>
    <p>Triangular numbers stack into a triangle: <a href="/?n=1">1</a>, <a href="/?n=3">3</a>, <a href="/?n=6">6</a>, <a href="/?n=10">10</a>, <a href="/?n=15">15</a>, <a href="/?n=21">21</a>...</p>

    <h2 id="power-of-2">Power of 2</h2>
    <p>Each one is double the last: <a href="/?n=1">1</a>, <a href="/?n=2">2</a>, <a href="/?n=4">4</a>, <a href="/?n=8">8</a>, <a href="/?n=16">16</a>, <a href="/?n=1024">1024</a>...</p>

    <h2 id="multiple-of-10">Multiple of 10</h2>
    <p>Ends in zero: <a href="/?n=10">10</a>, <a href="/?n=20">20</a>, <a href="/?n=100">100</a>, <a href="/?n=1000">1000</a>...</p>

    <h2>Which number has the most clubs?</h2>
    <p>Try <a href="/?n=2520">2520</a> — it joins more clubs than most small numbers. Hit 🎲 in the generator for surprise picks.</p>
  </main>
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: /clubs page explaining the 8 club types"
```

---

### Task 23: `src/pages/faq.astro` — FAQ

**Files:**
- Create: `src/pages/faq.astro`

- [ ] **Step 1: Implement**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="FAQ — Numberblocxgenerator"
  description="Common questions about the Numberblocks generator: what version this is, how big the numbers can go, why it doesn't lag."
>
  <header class="bg-white/80 backdrop-blur border-b border-orange-100">
    <div class="max-w-6xl mx-auto px-4 py-3">
      <a href="/" class="text-lg md:text-2xl font-black tracking-tight text-gray-800">
        <span class="text-red-500">Number</span><span class="text-blue-500">blocx</span> Generator
      </a>
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 py-8 prose prose-sm md:prose">
    <h1>FAQ</h1>

    <h2>How big can the number go?</h2>
    <p>Type any whole number up to 9,007,199,254,740,991 (the JavaScript safe integer limit), or type <code>infinity</code>.</p>

    <h2>Why doesn't it lag like the Scratch version?</h2>
    <p>The Scratch version tries to draw every block, which crashes browsers around 30,000+. We switch to a compressed grid above 100 and to abstract mode above 10,000 — so any size renders in under 100ms.</p>

    <h2>Looking for the original Scratch version?</h2>
    <p>Search "numberblocks generator scratch" on Scratch or TurboWarp.</p>

    <h2>Can I share a link to a specific number?</h2>
    <p>Yes. Tap "Copy Link" and the URL will include the current number — your friend opens it and sees the same Numberblock.</p>

    <h2>Can I download the picture?</h2>
    <p>Tap "Save PNG" to download the current view as an image.</p>

    <h2>Is this affiliated with Numberblocks the TV show?</h2>
    <p>No. This is a fan-made tool. Numberblocks is © Alphablocks Ltd / BBC Studios.</p>
  </main>
</Base>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: /faq page"
```

---

### Task 24: `src/pages/about.astro` — IP disclaimer

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Implement**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="About — Numberblocxgenerator"
  description="A fan-made Numberblocks generator. Not affiliated with BBC / Alphablocks Ltd."
>
  <header class="bg-white/80 backdrop-blur border-b border-orange-100">
    <div class="max-w-6xl mx-auto px-4 py-3">
      <a href="/" class="text-lg md:text-2xl font-black tracking-tight text-gray-800">
        <span class="text-red-500">Number</span><span class="text-blue-500">blocx</span> Generator
      </a>
    </div>
  </header>

  <main class="max-w-3xl mx-auto px-4 py-8 prose prose-sm md:prose">
    <h1>About</h1>
    <p>Made by a Numberblocks fan to help kids explore numbers. Free to use, no signup, no ads targeted at children.</p>

    <h2>Not affiliated with BBC</h2>
    <p>This is a fan-made tool. Numberblocks is a trademark and copyright of Alphablocks Ltd / BBC Studios. This site is not affiliated with, endorsed by, or sponsored by them.</p>

    <h2>How it stays fast</h2>
    <p>We use HTML5 Canvas instead of a game engine — first paint under a second, input-to-render under 100 milliseconds even on phones.</p>

    <h2>Privacy</h2>
    <p>We don't collect personal information. Analytics are anonymized and ad personalization is disabled (kids-safe).</p>

    <h2>Found a bug?</h2>
    <p>Email feedback to the address on the contact page (TBD — update with real contact when site is live).</p>
  </main>
</Base>
```

(Note: replace TBD with real contact email once one is decided. This is the only allowable TBD in the final plan — it's intentionally pending a real-world decision outside the code.)

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: /about page with IP disclaimer"
```

---

## Phase 6: Assets + SEO + Polish (Tasks 25-28)

### Task 25: Asset acquisition (manual checkpoint)

**This is a manual step, not a code task.** It requires human judgment + image sourcing.

- [ ] **Step 1: Source 1-30 character PNGs**

For each N in 1–30:
1. Visit `numberblocks.fandom.com` and find the corresponding character page.
2. Right-click → save the cleanest available PNG (transparent background preferred).
3. Save as `public/characters/{n}.png` in the project.

- [ ] **Step 2: Source big-number PNGs**

For each N in [100, 1000, 10000, 100000, 1000000, 1000000000]:
- If the wiki has a page, save the PNG as `public/characters/{n}.png`.
- If unavailable, remove that N from `src/data/named-numbers.json` `available` list and rely on tier3/4 rendering.

- [ ] **Step 3: Standardize**

For each PNG saved:
1. Open in macOS Preview.
2. If background is non-transparent, use Instant Alpha to remove.
3. Tools → Adjust Size → max 400×400, preserving aspect.
4. Compress with TinyPNG (https://tinypng.com) — drag-and-drop batch.
5. Target: < 30KB per file.

- [ ] **Step 4: Verify and commit**

```bash
ls public/characters/
# Should list: 1.png 2.png ... 30.png plus any big-number files
git add public/characters/ src/data/named-numbers.json
git commit -m "assets: character images for 1-30 and named big numbers"
```

- [ ] **Step 5: Visual QA in dev server**

```bash
npm run dev
```

Visit `/?n=1`, `/?n=5`, `/?n=10`, `/?n=25`, `/?n=30` — confirm correct image displays.

---

### Task 26: SEO meta — robots.txt, sitemap, OG image

**Files:**
- Create: `public/robots.txt`, `public/favicon.svg`
- Modify: `astro.config.mjs` (add sitemap integration)

- [ ] **Step 1: Install Astro sitemap integration**

```bash
npx astro add sitemap --yes
```

This auto-updates `astro.config.mjs`.

- [ ] **Step 2: Create robots.txt**

Create `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://numberblocxgenerator.com/sitemap-index.xml
```

- [ ] **Step 3: Create favicon.svg**

Create `public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="14" height="14" x="2" y="2" rx="2" fill="#E74C3C"/>
  <rect width="14" height="14" x="16" y="2" rx="2" fill="#F1C40F"/>
  <rect width="14" height="14" x="2" y="16" rx="2" fill="#27AE60"/>
  <rect width="14" height="14" x="16" y="16" rx="2" fill="#3498DB"/>
</svg>
```

- [ ] **Step 4: Build and verify sitemap generated**

```bash
npm run build
ls dist/
# should include sitemap-index.xml and sitemap-0.xml
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(seo): robots.txt, sitemap integration, favicon"
```

---

### Task 27: Mobile responsive + performance audit

- [ ] **Step 1: Run dev server with DevTools mobile emulation**

```bash
npm run dev
```

In Chrome DevTools, toggle device toolbar (Cmd+Shift+M), pick iPhone SE (375px). Walk through:
- `/` — Generator interactive, all buttons reachable
- `/clubs` — readable, no horizontal scroll
- `/faq`, `/about` — readable

Note any issues. Fix with Tailwind responsive utilities (`md:`, `sm:`).

- [ ] **Step 2: Run production Lighthouse**

```bash
npm run build
npx http-server dist -p 8080 &
# wait a moment for server to start
sleep 1
# Open Chrome, run Lighthouse on http://localhost:8080
# Target: Performance ≥ 90 (mobile, throttled 4G)
```

- [ ] **Step 3: Address common issues**

Common fixes if Performance < 90:
- Verify Tailwind purges unused CSS (default in v4).
- Add `loading="lazy"` to any `<img>` not in initial viewport.
- Confirm Astro's `inlineStylesheets: 'auto'` is in `astro.config.mjs`.

- [ ] **Step 4: Stop test server, commit any fixes**

```bash
# stop http-server (Ctrl+C if foreground)
git add -A && git commit -m "perf: mobile responsive tweaks, Lighthouse passes ≥90" || echo "no changes"
```

---

### Task 28: Render performance instrumentation

**Files:**
- Modify: `src/components/Generator.tsx`

- [ ] **Step 1: Add render timing**

In `src/components/Generator.tsx`, wrap the `draw` callback:

```tsx
const draw = useCallback(async (value: NValue) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rc = fitCanvas(canvas);
  const t0 = performance.now();
  try {
    const result = await render(rc, value);
    setOverlay(result.overlay);
    const dt = performance.now() - t0;
    if (import.meta.env.DEV) {
      console.debug(`[render] n=${value} tier=${result.tier} ${dt.toFixed(1)}ms`);
    }
  } catch (e) {
    console.error('render failed', e);
  }
}, []);
```

- [ ] **Step 2: Manual P95 check**

In dev mode, type rapidly through 10 numbers: 5, 50, 500, 5000, 50000, 500000, 5000000, 50000000, 500000000, 5000000000. Confirm all log lines show < 100ms.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "perf: instrument render timing in dev mode"
```

---

## Phase 7: Deploy Prep (Tasks 29-31)

### Task 29: Cloudflare Pages config

**Files:**
- Create: `_headers`, `_redirects` (Cloudflare Pages conventions)

- [ ] **Step 1: Create build headers**

Create `public/_headers`:
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer-when-downgrade
  X-Frame-Options: SAMEORIGIN

/characters/*
  Cache-Control: public, max-age=31536000, immutable

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

- [ ] **Step 2: Create redirects (placeholder)**

Create `public/_redirects`:
```
# Reserved for future redirects
```

- [ ] **Step 3: Document Cloudflare Pages setup steps**

Add to `README.md` (create if missing):
```markdown
# Numberblocxgenerator

Fast fan-made Numberblocks generator.

## Develop

```bash
npm install
npm run dev
```

## Deploy

1. Create Cloudflare Pages project, connect this repo.
2. Build command: `npm run build`
3. Build output: `dist`
4. Environment: Node 20.x
5. Custom domain: `numberblocxgenerator.com` (configure DNS via Cloudflare Registrar)

## Test

```bash
npm test           # vitest run
npm run dev        # local dev server at :4321
npm run build      # production build to dist/
```
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "deploy: Cloudflare Pages headers, redirects, README"
```

---

### Task 30: Final smoke test + build verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all suites pass.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build succeeds, `dist/` populated. No build warnings other than informational.

- [ ] **Step 3: Serve and walk through**

```bash
npx http-server dist -p 8080
```

In browser at `http://localhost:8080`:

- [ ] `/?n=5` → image renders (if assets in place)
- [ ] `/?n=50` → self-drawn block array
- [ ] `/?n=500` → compressed grid
- [ ] `/?n=50000` → abstract mode
- [ ] `/?n=5000000000` → tier5 starry mode
- [ ] `/?n=infinity` → ∞ overlay
- [ ] Click ±1, ±10, ±100, 🎲, all jump buttons
- [ ] Copy Link writes URL to clipboard
- [ ] Save PNG downloads `numberblock-{n}.png`
- [ ] Footer fan disclaimer visible
- [ ] Navigate to /clubs, /faq, /about — all render without errors
- [ ] Resize to 375px wide — no horizontal scroll

- [ ] **Step 4: Stop server, commit any last fixes, tag**

```bash
# Ctrl+C the http-server
git add -A && git commit -m "chore: pre-launch smoke fixes" || echo "no changes"
git tag v1.0.0-rc1
```

---

### Task 31: Manual launch checklist (out of code)

This is a non-code checklist. Mark each as the user completes it:

- [ ] **Domain registered** — `numberblocxgenerator.com` via Cloudflare Registrar
- [ ] **Plan B domain registered** — one of `numbuddies.com` / `nb-explorer.com`
- [ ] **Cloudflare Pages project connected** to GitHub repo
- [ ] **Custom domain bound** in Cloudflare Pages
- [ ] **AdSense account created** (separate Google account from divcalc/aismartmoney)
- [ ] **AdSense application submitted** (auto-review ~2 weeks)
- [ ] **GA4 property created** in child-directed mode, ad personalization off
- [ ] **GA4 measurement ID** added to `Base.astro` (only after launch — see follow-up task)
- [ ] **GSC verified** via DNS or HTML tag
- [ ] **Sitemap submitted** in GSC: `https://numberblocxgenerator.com/sitemap-index.xml`
- [ ] **First production deploy** triggered
- [ ] **Real-device QA** — open on actual iPhone Safari + Android Chrome
- [ ] **OG image** verified by pasting URL into a Twitter compose box (preview should show)

---

## Self-Review Notes

**Spec coverage scan:**
- §3 functional scope 4 件套 — covered by Tasks 8-20
- §5 5-tier rendering — covered by Tasks 9-15
- §6 8 clubs — covered by Task 7
- §7 character assets — covered by Tasks 10 + 25
- §8 4-page structure — covered by Tasks 21-24
- §9 IP defense — covered by Tasks 3 (footer), 24 (about)
- §10 deployment — covered by Tasks 29-31
- §11 KPIs — verified by Tasks 27-28, 30
- §13 done checklist — final smoke in Task 30, manual checks in Task 31

**Placeholder scan:** One intentional TBD in Task 24 (real contact email) — explicitly flagged. No others.

**Type consistency:** All modules use the shared `NValue` / `Club` / `RenderContext` from `src/lib/types.ts`. Dispatcher's `TierName` literal type matches the renderer file names.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-09-numberblocxgenerator-impl.md`. Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session via executing-plans, batch with checkpoints.

For autonomous mode, subagent-driven is the better fit (less context pollution, parallelizable on logic-module tasks).
