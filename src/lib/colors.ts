const PALETTE: Record<number, string> = {
  1: '#E74C3C',
  2: '#E67E22',
  3: '#F1C40F',
  4: '#27AE60',
  5: '#5DADE2',
  6: '#8E44AD',
  7: '#FF69B4',
  8: '#34495E',
  9: '#FF6B9D',
  10: '#3498DB',
};

export function getColor(n: number): string {
  if (n >= 1 && n <= 10) return PALETTE[n];
  const ones = ((n % 10) + 10) % 10;
  return ones === 0 ? PALETTE[10] : PALETTE[ones];
}
