// Generate original SVG placeholders for Numberblocks 1-30.
// Style: colored block stacks + generic happy face + number label.
// These are placeholders — NOT BBC character art. Replace public/characters/{n}.png
// with real artwork to override (tier1 loader prefers .png and falls back to .svg).

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'characters');

const PALETTE = {
  1: '#E74C3C', 2: '#E67E22', 3: '#F1C40F', 4: '#27AE60', 5: '#5DADE2',
  6: '#8E44AD', 7: '#FF69B4', 8: '#34495E', 9: '#FF6B9D', 10: '#3498DB',
};

const HAND_TUNED = {
  1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 2], 5: [1, 5],
  6: [2, 3], 7: [1, 7], 8: [2, 4], 9: [3, 3], 10: [2, 5],
};

function getColor(n) {
  if (n >= 1 && n <= 10) return PALETTE[n];
  const ones = ((n % 10) + 10) % 10;
  return ones === 0 ? PALETTE[10] : PALETTE[ones];
}

function getLayout(n) {
  if (HAND_TUNED[n]) return HAND_TUNED[n];
  for (let w = Math.floor(Math.sqrt(n)); w >= 1; w--) {
    if (n % w === 0) return [w, Math.floor(n / w)];
  }
  return [1, n];
}

function getDisplayLayout(n) {
  const [w, h] = getLayout(n);
  if (w === 1 && n > 10) {
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    return [cols, rows];
  }
  return [w, h];
}

function generateSvg(n) {
  const [cols, rows] = getDisplayLayout(n);
  const B = 100;
  const W = cols * B;
  const H = rows * B;
  const color = getColor(n);
  const lastRowCount = ((n - 1) % cols) + 1;

  let blocks = '';
  let drawn = 0;
  for (let row = 0; row < rows; row++) {
    const inRow = row === rows - 1 ? lastRowCount : cols;
    const offsetX = ((cols - inRow) * B) / 2;
    for (let col = 0; col < inRow; col++) {
      if (drawn >= n) break;
      const x = offsetX + col * B;
      const y = (rows - 1 - row) * B;
      blocks += `
  <rect x="${x}" y="${y}" width="${B}" height="${B}" fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>
  <rect x="${x}" y="${y}" width="${B}" height="${B * 0.18}" fill="rgba(255,255,255,0.2)"/>
  <rect x="${x}" y="${y + B * 0.82}" width="${B}" height="${B * 0.18}" fill="rgba(0,0,0,0.12)"/>`;
      drawn++;
    }
  }

  // Generic happy face on the top row, centered over occupied cells.
  const topRowOffsetX = ((cols - lastRowCount) * B) / 2;
  const faceCx = topRowOffsetX + (lastRowCount * B) / 2;
  const faceCy = B / 2;
  const eyeR = B * 0.135;
  const eyeOffX = B * 0.19;
  const eyeOffY = B * 0.08;
  const face = `
  <circle cx="${faceCx - eyeOffX}" cy="${faceCy - eyeOffY}" r="${eyeR}" fill="white"/>
  <circle cx="${faceCx - eyeOffX + 1}" cy="${faceCy - eyeOffY + 1}" r="${eyeR * 0.6}" fill="#222"/>
  <circle cx="${faceCx + eyeOffX}" cy="${faceCy - eyeOffY}" r="${eyeR}" fill="white"/>
  <circle cx="${faceCx + eyeOffX + 1}" cy="${faceCy - eyeOffY + 1}" r="${eyeR * 0.6}" fill="#222"/>
  <path d="M ${faceCx - B * 0.18} ${faceCy + B * 0.13} Q ${faceCx} ${faceCy + B * 0.32}, ${faceCx + B * 0.18} ${faceCy + B * 0.13}"
        stroke="#222" stroke-width="${B * 0.045}" fill="none" stroke-linecap="round"/>`;

  // Number label — bottom-right corner of the artwork (clearly identifies which numberblock)
  const labelSize = Math.min(B * 0.45, B * 30 / (String(n).length + 2));
  const numberLabel = `
  <text x="${W - B * 0.1}" y="${H - B * 0.12}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-weight="900"
        font-size="${labelSize}"
        fill="white"
        stroke="rgba(0,0,0,0.55)"
        stroke-width="${labelSize * 0.08}"
        paint-order="stroke fill"
        text-anchor="end">${n}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${blocks}
${face}
${numberLabel}
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (let n = 1; n <= 30; n++) {
  writeFileSync(join(OUT_DIR, `${n}.svg`), generateSvg(n));
}
console.log(`Generated ${30} SVG placeholders in ${OUT_DIR}`);
