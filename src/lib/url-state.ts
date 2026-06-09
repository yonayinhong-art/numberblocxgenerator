import type { NValue } from './types';

export function parseN(raw: string | null, fallback: NValue = 5): NValue {
  if (raw == null) return fallback;
  const cleaned = raw.replace(/[,\s]/g, '').toLowerCase();
  if (cleaned === 'infinity' || cleaned === 'inf' || cleaned === '∞') return 'infinity';
  const num = parseInt(cleaned, 10);
  if (!Number.isFinite(num) || num < 1) return fallback;
  return Math.min(num, Number.MAX_SAFE_INTEGER);
}

export function serializeN(n: NValue): string {
  return n === 'infinity' ? 'infinity' : String(n);
}
