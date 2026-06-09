import { describe, it, expect } from 'vitest';
import { parseN, serializeN } from '../src/lib/url-state';

describe('parseN', () => {
  it('parses integer query', () => {
    expect(parseN('1000')).toBe(1000);
  });
  it('parses infinity', () => {
    expect(parseN('infinity')).toBe('infinity');
    expect(parseN('inf')).toBe('infinity');
    expect(parseN('∞')).toBe('infinity');
  });
  it('falls back to default for invalid', () => {
    expect(parseN(null, 5)).toBe(5);
    expect(parseN('garbage', 5)).toBe(5);
  });
});

describe('serializeN', () => {
  it('numbers to string', () => {
    expect(serializeN(42)).toBe('42');
  });
  it('infinity literal', () => {
    expect(serializeN('infinity')).toBe('infinity');
  });
});
