import { describe, it, expect } from 'vitest';
import { formatBig, numberToWords, factorize } from '../src/lib/format';

describe('formatBig', () => {
  it('< 1000 unchanged', () => {
    expect(formatBig(42)).toBe('42');
  });
  it('thousands', () => {
    expect(formatBig(1000)).toBe('1K');
    expect(formatBig(1500)).toBe('1.5K');
  });
  it('millions/billions/trillions', () => {
    expect(formatBig(1_000_000)).toBe('1M');
    expect(formatBig(1_000_000_000)).toBe('1B');
    expect(formatBig(1_000_000_000_000)).toBe('1T');
  });
});

describe('factorize', () => {
  it('primes', () => {
    expect(factorize(7)).toEqual([7]);
  });
  it('composites', () => {
    expect(factorize(12)).toEqual([2, 2, 3]);
    expect(factorize(100)).toEqual([2, 2, 5, 5]);
  });
  it('returns null for too-big numbers', () => {
    expect(factorize(1e8)).toBeNull();
  });
});

describe('numberToWords', () => {
  it('small numbers', () => {
    expect(numberToWords(5)).toBe('five');
    expect(numberToWords(19)).toBe('nineteen');
  });
  it('big-number suffixes', () => {
    expect(numberToWords(1_000_000)).toMatch(/million/);
    expect(numberToWords(2_000_000_000)).toMatch(/billion/);
  });
});
