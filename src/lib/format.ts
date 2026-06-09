const SMALL_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];

function trimZero(v: number): string {
  return v % 1 === 0 ? v.toFixed(0) : v.toFixed(1);
}

export function formatBig(n: number): string {
  if (n >= 1e12) return trimZero(n / 1e12) + 'T';
  if (n >= 1e9) return trimZero(n / 1e9) + 'B';
  if (n >= 1e6) return trimZero(n / 1e6) + 'M';
  if (n >= 1e3) return trimZero(n / 1e3) + 'K';
  return n.toLocaleString('en-US');
}

export function numberToWords(n: number): string {
  if (n < 20) return SMALL_WORDS[n] ?? n.toLocaleString('en-US');
  if (n < 1e6) return n.toLocaleString('en-US');
  if (n < 1e9) return `${trimZero(n / 1e6)} million`;
  if (n < 1e12) return `${trimZero(n / 1e9)} billion`;
  if (n < 1e15) return `${trimZero(n / 1e12)} trillion`;
  return n.toExponential(2);
}

export function factorize(n: number): number[] | null {
  if (n > 1e7 || n < 2 || !Number.isInteger(n)) return null;
  const factors: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      factors.push(p);
      x = Math.floor(x / p);
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}
