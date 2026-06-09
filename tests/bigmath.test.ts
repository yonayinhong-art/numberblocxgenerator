import { describe, it, expect } from 'vitest';
import { isqrt, icbrt, isPrimeMR } from '../src/lib/bigmath';

describe('isqrt', () => {
  it('exact integer square roots', () => {
    expect(isqrt(0n)).toBe(0n);
    expect(isqrt(1n)).toBe(1n);
    expect(isqrt(4n)).toBe(2n);
    expect(isqrt(10000n)).toBe(100n);
  });
  it('floor for non-squares', () => {
    expect(isqrt(2n)).toBe(1n);
    expect(isqrt(8n)).toBe(2n);
    expect(isqrt(99n)).toBe(9n);
  });
  it('works for very large numbers', () => {
    expect(isqrt(10n ** 30n)).toBe(10n ** 15n);
  });
});

describe('icbrt', () => {
  it('exact integer cube roots', () => {
    expect(icbrt(0n)).toBe(0n);
    expect(icbrt(1n)).toBe(1n);
    expect(icbrt(8n)).toBe(2n);
    expect(icbrt(1000n)).toBe(10n);
  });
  it('floor for non-cubes', () => {
    expect(icbrt(9n)).toBe(2n);
    expect(icbrt(1001n)).toBe(10n);
  });
});

describe('isPrimeMR', () => {
  it('small primes', () => {
    expect(isPrimeMR(2n)).toBe(true);
    expect(isPrimeMR(3n)).toBe(true);
    expect(isPrimeMR(97n)).toBe(true);
  });
  it('small composites', () => {
    expect(isPrimeMR(1n)).toBe(false);
    expect(isPrimeMR(4n)).toBe(false);
    expect(isPrimeMR(91n)).toBe(false);
  });
  it('Carmichael numbers correctly rejected', () => {
    expect(isPrimeMR(561n)).toBe(false);
    expect(isPrimeMR(1105n)).toBe(false);
  });
  it('large primes', () => {
    expect(isPrimeMR(2n ** 31n - 1n)).toBe(true);
    expect(isPrimeMR(1000000007n)).toBe(true);
  });
});
