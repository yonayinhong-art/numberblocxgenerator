const HAND_TUNED: Record<number, [number, number]> = {
  1: [1, 1], 2: [1, 2], 3: [1, 3], 4: [2, 2], 5: [1, 5],
  6: [2, 3], 7: [1, 7], 8: [2, 4], 9: [3, 3], 10: [2, 5],
};

export function getLayout(n: number): [number, number] {
  if (HAND_TUNED[n]) return HAND_TUNED[n];
  for (let w = Math.floor(Math.sqrt(n)); w >= 1; w--) {
    if (n % w === 0) return [w, Math.floor(n / w)];
  }
  const w = Math.ceil(Math.sqrt(n));
  return [w, Math.ceil(n / w)];
}
