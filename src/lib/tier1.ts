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
