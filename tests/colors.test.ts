import { describe, it, expect } from 'vitest';
import { getColor } from '../src/lib/colors';

describe('getColor', () => {
  it('returns the canonical color for 1-10', () => {
    expect(getColor(1)).toBe('#E74C3C');
    expect(getColor(10)).toBe('#3498DB');
  });
  it('cycles by ones digit for n > 10', () => {
    expect(getColor(15)).toBe(getColor(5));
    expect(getColor(23)).toBe(getColor(3));
  });
  it('uses 10 for multiples of 10 above 10', () => {
    expect(getColor(100)).toBe(getColor(10));
    expect(getColor(1000)).toBe(getColor(10));
  });
});
