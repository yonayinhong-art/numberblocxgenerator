import type { RenderContext, NValue } from './types';
import namedNumbers from '../data/named-numbers.json';

const AVAILABLE = new Set<number>(namedNumbers.available);
const knownMissing = new Set<number>();
const imageCache = new Map<number, HTMLImageElement>();

export function hasCharacterImage(n: NValue): n is number {
  return typeof n === 'number' && AVAILABLE.has(n) && !knownMissing.has(n);
}

export function markImageMissing(n: number): void {
  knownMissing.add(n);
}

function loadFrom(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadImage(n: number): Promise<HTMLImageElement> {
  const cached = imageCache.get(n);
  if (cached?.complete && cached.naturalWidth > 0) return cached;
  // Prefer .png (real BBC artwork if user added it), fall back to generated .svg placeholder.
  let img: HTMLImageElement;
  try {
    img = await loadFrom(`/characters/${n}.png`);
  } catch {
    img = await loadFrom(`/characters/${n}.svg`);
  }
  imageCache.set(n, img);
  return img;
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
