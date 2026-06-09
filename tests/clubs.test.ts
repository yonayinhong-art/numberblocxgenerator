import { describe, it, expect } from 'vitest';
import { getClubs } from '../src/lib/clubs';
import type { ClubName } from '../src/lib/types';

function matched(n: number | 'infinity', name: ClubName): boolean | null | undefined {
  const club = getClubs(n).find((c) => c.name === name);
  return club?.match;
}

describe('clubs', () => {
  it('even/odd', () => {
    expect(matched(2, 'Even')).toBe(true);
    expect(matched(3, 'Even')).toBe(false);
    expect(matched(3, 'Odd')).toBe(true);
  });
  it('prime', () => {
    expect(matched(2, 'Prime')).toBe(true);
    expect(matched(97, 'Prime')).toBe(true);
    expect(matched(91, 'Prime')).toBe(false);
    expect(matched(1, 'Prime')).toBe(false);
  });
  it('square / cube', () => {
    expect(matched(16, 'Square')).toBe(true);
    expect(matched(15, 'Square')).toBe(false);
    expect(matched(27, 'Cube')).toBe(true);
    expect(matched(64, 'Cube')).toBe(true);
    expect(matched(64, 'Square')).toBe(true);
  });
  it('triangular', () => {
    expect(matched(1, 'Triangular')).toBe(true);
    expect(matched(3, 'Triangular')).toBe(true);
    expect(matched(10, 'Triangular')).toBe(true);
    expect(matched(15, 'Triangular')).toBe(true);
    expect(matched(11, 'Triangular')).toBe(false);
  });
  it('power of 2', () => {
    expect(matched(1, 'PowerOf2')).toBe(true);
    expect(matched(1024, 'PowerOf2')).toBe(true);
    expect(matched(1000, 'PowerOf2')).toBe(false);
  });
  it('multiple of 10', () => {
    expect(matched(10, 'MultipleOf10')).toBe(true);
    expect(matched(100, 'MultipleOf10')).toBe(true);
    expect(matched(11, 'MultipleOf10')).toBe(false);
  });
  it('infinity returns club set', () => {
    const clubs = getClubs('infinity');
    expect(clubs.length).toBeGreaterThan(0);
  });
});
