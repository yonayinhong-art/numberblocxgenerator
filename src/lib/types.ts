// N can be a regular number (≤ Number.MAX_SAFE_INTEGER) or 'infinity'
export type NValue = number | 'infinity';

export type ClubName =
  | 'Even' | 'Odd' | 'Prime' | 'Square'
  | 'Cube' | 'Triangular' | 'PowerOf2' | 'MultipleOf10';

export interface Club {
  name: ClubName;
  label: string;
  emoji: string;
  match: boolean | null;  // null = too big to verify
  certain: boolean;
}

export type TierName = 'image' | 'tier2' | 'tier3' | 'tier4' | 'tier5';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
}
