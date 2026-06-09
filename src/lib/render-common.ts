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
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x, y, size, size * 0.18);
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
