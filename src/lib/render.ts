import type { RenderContext, NValue, TierName } from './types';
import { hasCharacterImage, renderTier1 } from './tier1';
import { renderTier2 } from './tier2';
import { renderTier3 } from './tier3';
import { renderTier4 } from './tier4';
import { renderTier5 } from './tier5';
import { clearCanvas } from './render-common';

export function pickTier(n: NValue): TierName {
  if (n === 'infinity') return 'tier5';
  if (hasCharacterImage(n)) return 'image';
  if (n <= 99) return 'tier2';
  if (n <= 9999) return 'tier3';
  if (n <= 1e9) return 'tier4';
  return 'tier5';
}

export interface RenderResult {
  tier: TierName;
  overlay: { label: string; sub: string } | null;
}

export async function render(rc: RenderContext, n: NValue): Promise<RenderResult> {
  clearCanvas(rc);
  const tier = pickTier(n);
  switch (tier) {
    case 'image':
      await renderTier1(rc, n as number);
      return { tier, overlay: null };
    case 'tier2':
      renderTier2(rc, n as number);
      return { tier, overlay: null };
    case 'tier3':
      renderTier3(rc, n as number);
      return { tier, overlay: null };
    case 'tier4':
      renderTier4(rc, n as number);
      return { tier, overlay: null };
    case 'tier5':
      return { tier, overlay: renderTier5(rc, n) };
  }
}
