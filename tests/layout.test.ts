import { describe, it, expect } from 'vitest';
import { getLayout } from '../src/lib/layout';

describe('getLayout', () => {
  it('hand-tuned for 1-10', () => {
    expect(getLayout(1)).toEqual([1, 1]);
    expect(getLayout(4)).toEqual([2, 2]);
    expect(getLayout(5)).toEqual([1, 5]);
    expect(getLayout(9)).toEqual([3, 3]);
    expect(getLayout(10)).toEqual([2, 5]);
  });
  it('chooses factor pair closest to square root for composites', () => {
    expect(getLayout(12)).toEqual([3, 4]);
    expect(getLayout(25)).toEqual([5, 5]);
    expect(getLayout(100)).toEqual([10, 10]);
  });
  it('returns [1, n] for primes (rendering layer decides display)', () => {
    expect(getLayout(11)).toEqual([1, 11]);
    expect(getLayout(13)).toEqual([1, 13]);
  });
});
