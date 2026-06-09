import { describe, it, expect } from 'vitest';
import { pickTier } from '../src/lib/render';

describe('pickTier', () => {
  it('image for 1-30', () => {
    expect(pickTier(1)).toBe('image');
    expect(pickTier(30)).toBe('image');
  });
  it('tier2 for 31-99', () => {
    expect(pickTier(31)).toBe('tier2');
    expect(pickTier(99)).toBe('tier2');
  });
  it('tier3 for unnamed 100-9999', () => {
    expect(pickTier(101)).toBe('tier3');
    expect(pickTier(2520)).toBe('tier3');
  });
  it('tier4 for 10K-1B', () => {
    expect(pickTier(10000)).toBe('tier4');
    expect(pickTier(999_999_999)).toBe('tier4');
  });
  it('tier5 for >1B and infinity', () => {
    expect(pickTier(1_000_000_001)).toBe('tier5');
    expect(pickTier('infinity')).toBe('tier5');
  });
});
