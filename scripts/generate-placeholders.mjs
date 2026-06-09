// Generate original SVG placeholders for Numberblocks 1-30.
// Style: colored block stacks + deterministically-varied face per N.
// Each N gets a distinct face by hashing N → eye/smile/brow/cheek/freckle variants.
// NOT BBC character art — replace public/characters/{n}.png with real artwork
// to override (tier1 loader prefers .png, falls back to .svg).

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

// Deterministic per-N hash → variant index
function pick(n, salt, mod) {
  let h = (n * 2654435761) ^ (salt * 1597463007);
  h = (h ^ (h >>> 16)) >>> 0;
  return h % mod;
}

// Whether the face color works on a dark or light block (for contrast tweaks)
function isDarkBlock(color) {
  // Roughly luminance check on the hex
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
}

function drawEyes(cx, cy, B, variant, gaze) {
  const offX = B * 0.19;
  const offY = B * 0.08;
  const offset = (g) => (g === 'left' ? -B * 0.025 : g === 'right' ? B * 0.025 : 0);
  const pupilDx = offset(gaze);

  if (variant === 0) {
    // Standard round
    const eyeR = B * 0.135;
    const pupilR = eyeR * 0.58;
    return `
  <circle cx="${cx - offX}" cy="${cy - offY}" r="${eyeR}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx + offX}" cy="${cy - offY}" r="${eyeR}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx - offX + pupilDx}" cy="${cy - offY + 1}" r="${pupilR}" fill="#222"/>
  <circle cx="${cx + offX + pupilDx}" cy="${cy - offY + 1}" r="${pupilR}" fill="#222"/>`;
  }
  if (variant === 1) {
    // Big wide-eyed
    const eyeR = B * 0.17;
    const pupilR = eyeR * 0.5;
    return `
  <circle cx="${cx - offX}" cy="${cy - offY}" r="${eyeR}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx + offX}" cy="${cy - offY}" r="${eyeR}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx - offX + pupilDx}" cy="${cy - offY + 2}" r="${pupilR}" fill="#222"/>
  <circle cx="${cx + offX + pupilDx}" cy="${cy - offY + 2}" r="${pupilR}" fill="#222"/>
  <circle cx="${cx - offX + pupilDx + B * 0.03}" cy="${cy - offY - B * 0.03}" r="${pupilR * 0.3}" fill="white"/>
  <circle cx="${cx + offX + pupilDx + B * 0.03}" cy="${cy - offY - B * 0.03}" r="${pupilR * 0.3}" fill="white"/>`;
  }
  if (variant === 2) {
    // Oval narrower (sleepy/chill)
    const eyeRX = B * 0.13;
    const eyeRY = B * 0.07;
    return `
  <ellipse cx="${cx - offX}" cy="${cy - offY}" rx="${eyeRX}" ry="${eyeRY}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <ellipse cx="${cx + offX}" cy="${cy - offY}" rx="${eyeRX}" ry="${eyeRY}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx - offX + pupilDx}" cy="${cy - offY}" r="${eyeRY * 0.7}" fill="#222"/>
  <circle cx="${cx + offX + pupilDx}" cy="${cy - offY}" r="${eyeRY * 0.7}" fill="#222"/>`;
  }
  // variant === 3 — small dot eyes (calm/serious)
  const eyeR = B * 0.085;
  return `
  <circle cx="${cx - offX}" cy="${cy - offY}" r="${eyeR}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx + offX}" cy="${cy - offY}" r="${eyeR}" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <circle cx="${cx - offX + pupilDx}" cy="${cy - offY}" r="${eyeR * 0.7}" fill="#222"/>
  <circle cx="${cx + offX + pupilDx}" cy="${cy - offY}" r="${eyeR * 0.7}" fill="#222"/>`;
}

function drawMouth(cx, cy, B, variant) {
  const sw = B * 0.045;
  if (variant === 0) {
    // Default soft smile
    return `<path d="M ${cx - B * 0.18} ${cy + B * 0.13} Q ${cx} ${cy + B * 0.30}, ${cx + B * 0.18} ${cy + B * 0.13}"
            stroke="#222" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
  }
  if (variant === 1) {
    // Big open grin (filled)
    return `<path d="M ${cx - B * 0.22} ${cy + B * 0.10} Q ${cx} ${cy + B * 0.38}, ${cx + B * 0.22} ${cy + B * 0.10} Z"
            fill="#222" stroke="#222" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M ${cx - B * 0.22} ${cy + B * 0.10} Q ${cx} ${cy + B * 0.16}, ${cx + B * 0.22} ${cy + B * 0.10}"
            stroke="white" stroke-width="${sw * 1.4}" fill="white" stroke-linecap="round"/>`;
  }
  if (variant === 2) {
    // Small subtle smile
    return `<path d="M ${cx - B * 0.10} ${cy + B * 0.17} Q ${cx} ${cy + B * 0.24}, ${cx + B * 0.10} ${cy + B * 0.17}"
            stroke="#222" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
  }
  if (variant === 3) {
    // Tilted/cheeky smile
    return `<path d="M ${cx - B * 0.16} ${cy + B * 0.18} Q ${cx + B * 0.02} ${cy + B * 0.30}, ${cx + B * 0.20} ${cy + B * 0.12}"
            stroke="#222" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
  }
  // variant === 4 — round "o" (surprised/excited)
  return `<ellipse cx="${cx}" cy="${cy + B * 0.20}" rx="${B * 0.07}" ry="${B * 0.09}"
            fill="#222"/>`;
}

function drawBrows(cx, cy, B, variant) {
  if (variant === 0) return ''; // none
  const sw = B * 0.04;
  const offX = B * 0.19;
  const offY = B * 0.22;
  const w = B * 0.10;
  if (variant === 1) {
    // Flat horizontal lines (focused/cool)
    return `
  <line x1="${cx - offX - w}" y1="${cy - offY}" x2="${cx - offX + w}" y2="${cy - offY}" stroke="#222" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="${cx + offX - w}" y1="${cy - offY}" x2="${cx + offX + w}" y2="${cy - offY}" stroke="#222" stroke-width="${sw}" stroke-linecap="round"/>`;
  }
  // variant === 2 — arched (curious/raised)
  return `
  <path d="M ${cx - offX - w} ${cy - offY + B * 0.02} Q ${cx - offX} ${cy - offY - B * 0.05}, ${cx - offX + w} ${cy - offY + B * 0.02}"
        stroke="#222" stroke-width="${sw}" fill="none" stroke-linecap="round"/>
  <path d="M ${cx + offX - w} ${cy - offY + B * 0.02} Q ${cx + offX} ${cy - offY - B * 0.05}, ${cx + offX + w} ${cy - offY + B * 0.02}"
        stroke="#222" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
}

function drawCheeks(cx, cy, B, variant, isDark) {
  if (variant === 0) return ''; // none
  const offX = B * 0.32;
  const offY = B * 0.10;
  const r = B * 0.06;
  const fill = isDark ? 'rgba(255,140,170,0.55)' : 'rgba(255,80,120,0.45)';
  if (variant === 1) {
    // Round blush dots
    return `
  <circle cx="${cx - offX}" cy="${cy + offY}" r="${r}" fill="${fill}"/>
  <circle cx="${cx + offX}" cy="${cy + offY}" r="${r}" fill="${fill}"/>`;
  }
  // variant === 2 — three tiny freckle dots on each side
  return `
  <circle cx="${cx - offX}" cy="${cy + offY - r * 0.8}" r="${r * 0.35}" fill="${fill}"/>
  <circle cx="${cx - offX - r * 0.9}" cy="${cy + offY + r * 0.3}" r="${r * 0.35}" fill="${fill}"/>
  <circle cx="${cx - offX + r * 0.9}" cy="${cy + offY + r * 0.3}" r="${r * 0.35}" fill="${fill}"/>
  <circle cx="${cx + offX}" cy="${cy + offY - r * 0.8}" r="${r * 0.35}" fill="${fill}"/>
  <circle cx="${cx + offX + r * 0.9}" cy="${cy + offY + r * 0.3}" r="${r * 0.35}" fill="${fill}"/>
  <circle cx="${cx + offX - r * 0.9}" cy="${cy + offY + r * 0.3}" r="${r * 0.35}" fill="${fill}"/>`;
}

function generateSvg(n) {
  const [cols, rows] = getDisplayLayout(n);
  const B = 100;
  const W = cols * B;
  const H = rows * B;
  const color = getColor(n);
  const dark = isDarkBlock(color);
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
  <rect x="${x}" y="${y}" width="${B}" height="${B}" fill="${color}" stroke="rgba(0,0,0,0.28)" stroke-width="1.5"/>
  <rect x="${x}" y="${y}" width="${B}" height="${B * 0.2}" fill="rgba(255,255,255,0.22)"/>
  <rect x="${x}" y="${y + B * 0.8}" width="${B}" height="${B * 0.2}" fill="rgba(0,0,0,0.14)"/>`;
      drawn++;
    }
  }

  // Face on top row, centered over occupied cells
  const topRowOffsetX = ((cols - lastRowCount) * B) / 2;
  const faceCx = topRowOffsetX + (lastRowCount * B) / 2;
  const faceCy = B / 2;

  // Pick variants deterministically per N
  const eyeV = pick(n, 1, 4);
  const mouthV = pick(n, 2, 5);
  const browV = pick(n, 3, 3);
  const cheekV = pick(n, 4, 3);
  const gazeIdx = pick(n, 5, 3);
  const gaze = ['center', 'left', 'right'][gazeIdx];

  const face = drawBrows(faceCx, faceCy, B, browV)
    + drawEyes(faceCx, faceCy, B, eyeV, gaze)
    + drawCheeks(faceCx, faceCy, B, cheekV, dark)
    + drawMouth(faceCx, faceCy, B, mouthV);

  // Number label — bottom-right corner of the artwork
  const labelSize = Math.min(B * 0.42, (B * 0.7) / Math.max(1, String(n).length / 2));
  const numberLabel = `
  <text x="${W - B * 0.1}" y="${H - B * 0.12}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-weight="900"
        font-size="${labelSize}"
        fill="white"
        stroke="rgba(0,0,0,0.6)"
        stroke-width="${labelSize * 0.1}"
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
console.log(`Generated 30 SVG placeholders (with per-N face variants) in ${OUT_DIR}`);
