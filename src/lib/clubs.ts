import type { Club, ClubName, NValue } from './types';
import { isqrt, isPrimeMR } from './bigmath';

const SAFE_NUMBER_LIMIT = 1e15;

function isPrime(n: number): boolean | null {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  if (n > SAFE_NUMBER_LIMIT) {
    return isPrimeMR(BigInt(Math.round(n)));
  }
  if (n <= 1e10) {
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }
  return isPrimeMR(BigInt(n));
}

function isSquare(n: number): boolean {
  if (n < 1) return false;
  if (n > Number.MAX_SAFE_INTEGER) {
    const big = BigInt(Math.round(n));
    const s = isqrt(big);
    return s * s === big;
  }
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

function isCube(n: number): boolean {
  if (n < 1) return false;
  const c = Math.round(Math.cbrt(n));
  return c * c * c === n;
}

function isTriangular(n: number): boolean {
  if (n < 1) return false;
  const x = 8 * n + 1;
  if (x > Number.MAX_SAFE_INTEGER) {
    const big = 8n * BigInt(Math.round(n)) + 1n;
    const s = isqrt(big);
    return s * s === big;
  }
  const s = Math.round(Math.sqrt(x));
  return s * s === x;
}

function isPowerOf2(n: number): boolean {
  if (n < 1 || !Number.isInteger(n)) return false;
  if (n <= Number.MAX_SAFE_INTEGER) {
    return (BigInt(n) & (BigInt(n) - 1n)) === 0n;
  }
  return false;
}

const CLUB_LABELS: Record<ClubName, { label: string; emoji: string }> = {
  Even: { label: 'Even', emoji: '✌️' },
  Odd: { label: 'Odd', emoji: '☝️' },
  Prime: { label: 'Prime', emoji: '⭐' },
  Square: { label: 'Square', emoji: '⏹️' },
  Cube: { label: 'Cube', emoji: '🧊' },
  Triangular: { label: 'Triangular', emoji: '🔺' },
  PowerOf2: { label: 'Power of 2', emoji: '⚡' },
  MultipleOf10: { label: 'Multiple of 10', emoji: '🔟' },
};

function makeClub(name: ClubName, match: boolean | null, certain: boolean): Club {
  const { label, emoji } = CLUB_LABELS[name];
  return { name, label, emoji, match, certain };
}

export function getClubs(n: NValue): Club[] {
  if (n === 'infinity') {
    return [makeClub('Even', null, false)];
  }
  if (!Number.isFinite(n) || n < 1) return [];

  const primeResult = isPrime(n);
  return [
    makeClub('Even', n % 2 === 0, true),
    makeClub('Odd', n % 2 !== 0, true),
    makeClub('Prime', primeResult, primeResult !== null),
    makeClub('Square', isSquare(n), true),
    makeClub('Cube', isCube(n), true),
    makeClub('Triangular', isTriangular(n), true),
    makeClub('PowerOf2', isPowerOf2(n), n <= Number.MAX_SAFE_INTEGER),
    makeClub('MultipleOf10', n % 10 === 0 && n > 0, true),
  ];
}
