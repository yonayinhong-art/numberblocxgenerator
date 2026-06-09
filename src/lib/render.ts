import type { RenderContext, NValue, TierName } from './types';
import { hasCharacterImage, renderTier1, markImageMissing } from './tier1';
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

function renderAlgorithmic(rc: RenderContext, n: NValue): RenderResult {
  if (n === 'infinity') return { tier: 'tier5', overlay: renderTier5(rc, n) };
  if (n <= 99) {
    renderTier2(rc, n);
    return { tier: 'tier2', overlay: null };
  }
  if (n <= 9999) {
    renderTier3(rc, n);
    return { tier: 'tier3', overlay: null };
  }
  if (n <= 1e9) {
    renderTier4(rc, n);
    return { tier: 'tier4', overlay: null };
  }
  return { tier: 'tier5', overlay: renderTier5(rc, n) };
}

export async function render(rc: RenderContext, n: NValue): Promise<RenderResult> {
  clearCanvas(rc);
  const tier = pickTier(n);
  if (tier === 'image') {
    try {
      await renderTier1(rc, n as number);
      return { tier, overlay: null };
    } catch {
      markImageMissing(n as number);
      clearCanvas(rc);
      return renderAlgorithmic(rc, n);
    }
  }
  return renderAlgorithmic(rc, n);
}
