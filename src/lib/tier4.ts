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
