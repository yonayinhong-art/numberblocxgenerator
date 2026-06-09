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
