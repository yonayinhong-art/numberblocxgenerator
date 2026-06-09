import type { RenderContext } from './types';
import { getColor } from './colors';
import { getLayout } from './layout';
import { drawBlock, drawFace } from './render-common';

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

  const topRowY = startY;
  const topRowCount = lastRowCount;
  const topRowOffsetX = (cols - topRowCount) * blockSize / 2;
  const faceCx = startX + topRowOffsetX + (topRowCount * blockSize) / 2;
  const faceCy = topRowY + blockSize / 2;
  drawFace(rc, faceCx, faceCy, blockSize);
}
