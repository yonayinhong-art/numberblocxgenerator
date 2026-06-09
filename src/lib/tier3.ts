import type { RenderContext } from './types';
import { getColor } from './colors';
import { drawFace } from './render-common';

export function renderTier3(rc: RenderContext, n: number): void {
  const { ctx, width, height } = rc;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
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

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(startX, startY, cols * blockSize, blockSize * 0.3);

  const faceSize = Math.min(width * 0.25, 110);
  drawFace(rc, width / 2, height * 0.42, faceSize);

  ctx.font = `900 ${Math.min(width * 0.13, 56)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 6;
  ctx.strokeText(n.toLocaleString('en-US'), width / 2, height * 0.78);
  ctx.fillStyle = 'white';
  ctx.fillText(n.toLocaleString('en-US'), width / 2, height * 0.78);
}
