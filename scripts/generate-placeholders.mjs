// Generate original SVG placeholders for Numberblocks 1-30.
// Aim: kid-appealing "geometric cute" — rounded blocks, gradients, shiny anime
// eyes, expressive mouths, optional waving hands, sparkles. NOT BBC character
// art (no specific character traits like cat ears / octopus arms / specific hats).
// Replace public/characters/{n}.png with real artwork to override.

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

function pick(n, salt, mod) {
  let h = (n * 2654435761) ^ (salt * 1597463007);
  h = (h ^ (h >>> 16)) >>> 0;
  return h % mod;
}

function lighten(hex, amt) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex, amt) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amt);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function blockTexture(x, y, B, variant) {
  if (variant === 0) return '';
  if (variant === 1) {
    // Polka dots
    let dots = '';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dx = x + B * 0.2 + col * B * 0.3;
        const dy = y + B * 0.25 + row * B * 0.27;
        dots += `<circle cx="${dx}" cy="${dy}" r="${B * 0.04}" fill="rgba(255,255,255,0.35)"/>`;
      }
    }
    return dots;
  }
  if (variant === 2) {
    // Diagonal stripes
    let stripes = '';
    for (let i = -1; i < 4; i++) {
      const xx = x + i * B * 0.3;
      stripes += `<line x1="${xx}" y1="${y + B}" x2="${xx + B}" y2="${y}" stroke="rgba(255,255,255,0.18)" stroke-width="${B * 0.08}"/>`;
    }
    return `<g clip-path="inset(0 round ${B * 0.1})">${stripes}</g>`;
  }
  // variant 3 — cross hatch
  let cross = '';
  for (let i = 1; i < 4; i++) {
    cross += `<line x1="${x}" y1="${y + i * B * 0.25}" x2="${x + B}" y2="${y + i * B * 0.25}" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>`;
    cross += `<line x1="${x + i * B * 0.25}" y1="${y}" x2="${x + i * B * 0.25}" y2="${y + B}" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>`;
  }
  return cross;
}

function drawBlock(x, y, B, gradientId, textureVariant) {
  return `
  <rect x="${x}" y="${y}" width="${B}" height="${B}" rx="${B * 0.1}" fill="url(#${gradientId})" stroke="rgba(0,0,0,0.25)" stroke-width="1.5"/>
  ${blockTexture(x, y, B, textureVariant)}
  <rect x="${x + B * 0.08}" y="${y + B * 0.08}" width="${B * 0.84}" height="${B * 0.15}" rx="${B * 0.05}" fill="rgba(255,255,255,0.32)"/>`;
}

function drawEyes(cx, cy, B, variant) {
  const offX = B * 0.21;
  if (variant === 0) {
    // Big shiny round
    const r = B * 0.16;
    return `
  <ellipse cx="${cx - offX}" cy="${cy}" rx="${r * 0.92}" ry="${r}" fill="white" stroke="#1a1a1a" stroke-width="2.5"/>
  <ellipse cx="${cx + offX}" cy="${cy}" rx="${r * 0.92}" ry="${r}" fill="white" stroke="#1a1a1a" stroke-width="2.5"/>
  <ellipse cx="${cx - offX + 1.5}" cy="${cy + 2}" rx="${r * 0.55}" ry="${r * 0.65}" fill="#1a1a1a"/>
  <ellipse cx="${cx + offX + 1.5}" cy="${cy + 2}" rx="${r * 0.55}" ry="${r * 0.65}" fill="#1a1a1a"/>
  <circle cx="${cx - offX + r * 0.25}" cy="${cy - r * 0.35}" r="${r * 0.28}" fill="white"/>
  <circle cx="${cx + offX + r * 0.25}" cy="${cy - r * 0.35}" r="${r * 0.28}" fill="white"/>
  <circle cx="${cx - offX - r * 0.25}" cy="${cy + r * 0.25}" r="${r * 0.13}" fill="white"/>
  <circle cx="${cx + offX - r * 0.25}" cy="${cy + r * 0.25}" r="${r * 0.13}" fill="white"/>`;
  }
  if (variant === 1) {
    // Sparkle eyes — star highlights
    const r = B * 0.16;
    return `
  <circle cx="${cx - offX}" cy="${cy}" r="${r}" fill="white" stroke="#1a1a1a" stroke-width="2.5"/>
  <circle cx="${cx + offX}" cy="${cy}" r="${r}" fill="white" stroke="#1a1a1a" stroke-width="2.5"/>
  <circle cx="${cx - offX}" cy="${cy + 1}" r="${r * 0.65}" fill="#1a1a1a"/>
  <circle cx="${cx + offX}" cy="${cy + 1}" r="${r * 0.65}" fill="#1a1a1a"/>
  <path d="M ${cx - offX + r * 0.2} ${cy - r * 0.4} L ${cx - offX + r * 0.32} ${cy - r * 0.15} L ${cx - offX + r * 0.55} ${cy - r * 0.05} L ${cx - offX + r * 0.32} ${cy + r * 0.05} L ${cx - offX + r * 0.2} ${cy + r * 0.3} L ${cx - offX + r * 0.08} ${cy + r * 0.05} L ${cx - offX - r * 0.15} ${cy - r * 0.05} L ${cx - offX + r * 0.08} ${cy - r * 0.15} Z" fill="white"/>
  <path d="M ${cx + offX + r * 0.2} ${cy - r * 0.4} L ${cx + offX + r * 0.32} ${cy - r * 0.15} L ${cx + offX + r * 0.55} ${cy - r * 0.05} L ${cx + offX + r * 0.32} ${cy + r * 0.05} L ${cx + offX + r * 0.2} ${cy + r * 0.3} L ${cx + offX + r * 0.08} ${cy + r * 0.05} L ${cx + offX - r * 0.15} ${cy - r * 0.05} L ${cx + offX + r * 0.08} ${cy - r * 0.15} Z" fill="white"/>`;
  }
  if (variant === 2) {
    // Closed happy ^_^ smile eyes
    const w = B * 0.18;
    return `
  <path d="M ${cx - offX - w / 2} ${cy + B * 0.04} Q ${cx - offX} ${cy - B * 0.10}, ${cx - offX + w / 2} ${cy + B * 0.04}"
        stroke="#1a1a1a" stroke-width="${B * 0.045}" fill="none" stroke-linecap="round"/>
  <path d="M ${cx + offX - w / 2} ${cy + B * 0.04} Q ${cx + offX} ${cy - B * 0.10}, ${cx + offX + w / 2} ${cy + B * 0.04}"
        stroke="#1a1a1a" stroke-width="${B * 0.045}" fill="none" stroke-linecap="round"/>`;
  }
  // variant 3 — wink (left closed, right open)
  const r = B * 0.16;
  return `
  <path d="M ${cx - offX - B * 0.1} ${cy + B * 0.02} Q ${cx - offX} ${cy - B * 0.10}, ${cx - offX + B * 0.1} ${cy + B * 0.02}"
        stroke="#1a1a1a" stroke-width="${B * 0.045}" fill="none" stroke-linecap="round"/>
  <ellipse cx="${cx + offX}" cy="${cy}" rx="${r * 0.92}" ry="${r}" fill="white" stroke="#1a1a1a" stroke-width="2.5"/>
  <ellipse cx="${cx + offX + 1.5}" cy="${cy + 2}" rx="${r * 0.55}" ry="${r * 0.65}" fill="#1a1a1a"/>
  <circle cx="${cx + offX + r * 0.25}" cy="${cy - r * 0.35}" r="${r * 0.28}" fill="white"/>`;
}

function drawMouth(cx, cy, B, variant) {
  if (variant === 0) {
    // Soft smile
    return `<path d="M ${cx - B * 0.16} ${cy + B * 0.18} Q ${cx} ${cy + B * 0.35}, ${cx + B * 0.16} ${cy + B * 0.18}"
            stroke="#1a1a1a" stroke-width="${B * 0.045}" fill="none" stroke-linecap="round"/>`;
  }
  if (variant === 1) {
    // Big open laugh with tongue
    return `
  <path d="M ${cx - B * 0.22} ${cy + B * 0.14} Q ${cx} ${cy + B * 0.46}, ${cx + B * 0.22} ${cy + B * 0.14} Z"
        fill="#3D1820" stroke="#1a1a1a" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M ${cx - B * 0.20} ${cy + B * 0.14} Q ${cx - B * 0.07} ${cy + B * 0.20}, ${cx + B * 0.07} ${cy + B * 0.20} Q ${cx + B * 0.20} ${cy + B * 0.14}, ${cx - B * 0.20} ${cy + B * 0.14}"
        fill="white"/>
  <ellipse cx="${cx}" cy="${cy + B * 0.34}" rx="${B * 0.12}" ry="${B * 0.08}" fill="#FF7C8C"/>
  <line x1="${cx}" y1="${cy + B * 0.28}" x2="${cx}" y2="${cy + B * 0.40}" stroke="#E84B5C" stroke-width="1.5"/>`;
  }
  if (variant === 2) {
    // Toothy grin
    return `
  <path d="M ${cx - B * 0.18} ${cy + B * 0.15} Q ${cx} ${cy + B * 0.36}, ${cx + B * 0.18} ${cy + B * 0.15} Z"
        fill="#3D1820" stroke="#1a1a1a" stroke-width="2.5"/>
  <rect x="${cx - B * 0.05}" y="${cy + B * 0.15}" width="${B * 0.1}" height="${B * 0.1}" fill="white" stroke="#1a1a1a" stroke-width="1"/>
  <line x1="${cx}" y1="${cy + B * 0.15}" x2="${cx}" y2="${cy + B * 0.25}" stroke="#1a1a1a" stroke-width="1"/>`;
  }
  if (variant === 3) {
    // Surprised "o"
    return `<ellipse cx="${cx}" cy="${cy + B * 0.24}" rx="${B * 0.08}" ry="${B * 0.10}"
            fill="#3D1820" stroke="#1a1a1a" stroke-width="2.5"/>`;
  }
  // variant 4 — cheeky tilted smirk
  return `<path d="M ${cx - B * 0.15} ${cy + B * 0.20} Q ${cx + B * 0.02} ${cy + B * 0.32}, ${cx + B * 0.20} ${cy + B * 0.14}"
            stroke="#1a1a1a" stroke-width="${B * 0.045}" fill="none" stroke-linecap="round"/>`;
}

function drawCheeks(cx, cy, B, variant) {
  if (variant === 0) return '';
  if (variant === 1) {
    // Round blush dots
    return `
  <ellipse cx="${cx - B * 0.32}" cy="${cy + B * 0.12}" rx="${B * 0.085}" ry="${B * 0.055}" fill="rgba(255,140,170,0.6)"/>
  <ellipse cx="${cx + B * 0.32}" cy="${cy + B * 0.12}" rx="${B * 0.085}" ry="${B * 0.055}" fill="rgba(255,140,170,0.6)"/>`;
  }
  // variant 2 — three freckles each side
  const fill = 'rgba(255,255,255,0.7)';
  return `
  <circle cx="${cx - B * 0.30}" cy="${cy + B * 0.08}" r="${B * 0.018}" fill="${fill}"/>
  <circle cx="${cx - B * 0.34}" cy="${cy + B * 0.14}" r="${B * 0.018}" fill="${fill}"/>
  <circle cx="${cx - B * 0.28}" cy="${cy + B * 0.16}" r="${B * 0.018}" fill="${fill}"/>
  <circle cx="${cx + B * 0.30}" cy="${cy + B * 0.08}" r="${B * 0.018}" fill="${fill}"/>
  <circle cx="${cx + B * 0.34}" cy="${cy + B * 0.14}" r="${B * 0.018}" fill="${fill}"/>
  <circle cx="${cx + B * 0.28}" cy="${cy + B * 0.16}" r="${B * 0.018}" fill="${fill}"/>`;
}

function drawHand(side, cx, cy, B, color, variant) {
  // side: 'left' or 'right', position relative to the character shape
  if (variant === 0) return '';
  const sign = side === 'left' ? -1 : 1;
  // Arm pivot: attach point on body
  const ax = cx + sign * B * 0.55;
  const ay = cy + B * 0.2;
  // Hand position (waving up)
  const hx = ax + sign * B * 0.45;
  const hy = ay - B * 0.4;
  const armColor = darken(color, 30);
  if (variant === 1) {
    // Waving small hand
    return `
  <path d="M ${ax} ${ay} Q ${ax + sign * B * 0.2} ${ay - B * 0.05}, ${hx} ${hy}"
        stroke="${armColor}" stroke-width="${B * 0.16}" fill="none" stroke-linecap="round"/>
  <circle cx="${hx}" cy="${hy}" r="${B * 0.18}" fill="${color}" stroke="#1a1a1a" stroke-width="2"/>
  <path d="M ${hx - B * 0.08} ${hy - B * 0.05} Q ${hx} ${hy - B * 0.18}, ${hx + B * 0.08} ${hy - B * 0.05}"
        stroke="#1a1a1a" stroke-width="1.5" fill="none"/>`;
  }
  // variant 2 — peace/star hand
  return `
  <path d="M ${ax} ${ay} Q ${ax + sign * B * 0.2} ${ay - B * 0.05}, ${hx} ${hy}"
        stroke="${armColor}" stroke-width="${B * 0.14}" fill="none" stroke-linecap="round"/>
  <circle cx="${hx}" cy="${hy}" r="${B * 0.18}" fill="${color}" stroke="#1a1a1a" stroke-width="2"/>
  <line x1="${hx - B * 0.06}" y1="${hy - B * 0.05}" x2="${hx - B * 0.12}" y2="${hy - B * 0.20}" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="${hx + B * 0.06}" y1="${hy - B * 0.05}" x2="${hx + B * 0.12}" y2="${hy - B * 0.20}" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>`;
}

function drawSparkles(cx, cy, W, H, B, variant) {
  if (variant === 0) return '';
  const spark = (x, y, size) => `
    <path d="M ${x} ${y - size} L ${x + size * 0.25} ${y - size * 0.25} L ${x + size} ${y} L ${x + size * 0.25} ${y + size * 0.25} L ${x} ${y + size} L ${x - size * 0.25} ${y + size * 0.25} L ${x - size} ${y} L ${x - size * 0.25} ${y - size * 0.25} Z"
          fill="#FFEB3B" stroke="#FFA500" stroke-width="1"/>`;
  // 4 sparkles around the corners outside body
  return [
    spark(B * 0.3, cy - B * 0.1, B * 0.13),
    spark(W - B * 0.35, cy + B * 0.15, B * 0.10),
    spark(B * 0.4, H - B * 0.4, B * 0.08),
    spark(W - B * 0.45, H - B * 0.5, B * 0.11),
  ].join('');
}

function generateSvg(n) {
  const [cols, rows] = getDisplayLayout(n);
  const B = 100;
  const charW = cols * B;
  const charH = rows * B;
  // Pad so hand + sparkles don't clip
  const padX = B * 0.7;
  const padY = B * 0.4;
  const W = charW + padX * 2;
  const H = charH + padY * 2;
  const ox = padX;
  const oy = padY;
  const color = getColor(n);
  const lastRowCount = ((n - 1) % cols) + 1;

  // Variants
  const eyeV = pick(n, 1, 4);
  const mouthV = pick(n, 2, 5);
  const cheekV = pick(n, 3, 3);
  const textureV = pick(n, 4, 4);
  const handV = pick(n, 5, 3);
  const handSide = pick(n, 6, 2) === 0 ? 'left' : 'right';
  const sparkV = pick(n, 7, 2);

  // Gradient def
  const gradientId = `grad-${n}`;
  const gradientDef = `
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${lighten(color, 25)}"/>
      <stop offset="50%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${darken(color, 25)}"/>
    </linearGradient>
  </defs>`;

  // Blocks
  let blocks = '';
  let drawn = 0;
  for (let row = 0; row < rows; row++) {
    const inRow = row === rows - 1 ? lastRowCount : cols;
    const offsetX = ((cols - inRow) * B) / 2;
    for (let col = 0; col < inRow; col++) {
      if (drawn >= n) break;
      const x = ox + offsetX + col * B;
      const y = oy + (rows - 1 - row) * B;
      blocks += drawBlock(x, y, B, gradientId, textureV);
      drawn++;
    }
  }

  // Face on top row centered
  const topRowOffsetX = ((cols - lastRowCount) * B) / 2;
  const faceCx = ox + topRowOffsetX + (lastRowCount * B) / 2;
  const faceCy = oy + B / 2;

  const face = drawEyes(faceCx, faceCy, B, eyeV)
    + drawCheeks(faceCx, faceCy, B, cheekV)
    + drawMouth(faceCx, faceCy, B, mouthV);

  // Hand (sticks out from middle of character body)
  const hand = drawHand(handSide, ox + charW / 2, oy + charH / 2, B, color, handV);

  // Sparkles
  const sparkles = drawSparkles(W / 2, H / 2, W, H, B, sparkV);

  // Number label — bottom corner
  const labelSize = B * 0.45;
  const numberLabel = `
  <text x="${W - B * 0.15}" y="${H - B * 0.15}"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-weight="900"
        font-size="${labelSize}"
        fill="white"
        stroke="rgba(0,0,0,0.6)"
        stroke-width="${labelSize * 0.1}"
        paint-order="stroke fill"
        text-anchor="end">${n}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${gradientDef}${blocks}
${hand}
${face}
${sparkles}
${numberLabel}
</svg>
`;
}

mkdirSync(OUT_DIR, { recursive: true });
for (let n = 1; n <= 30; n++) {
  writeFileSync(join(OUT_DIR, `${n}.svg`), generateSvg(n));
}
console.log(`Generated 30 polished SVG placeholders in ${OUT_DIR}`);
