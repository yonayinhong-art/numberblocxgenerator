import type { NValue } from '../lib/types';

interface Props {
  current: NValue;
  onJump: (n: NValue) => void;
}

const JUMPS: { value: NValue; label: string; cls: string }[] = [
  { value: 10, label: '10', cls: 'bg-yellow-400 hover:bg-yellow-500' },
  { value: 100, label: '100', cls: 'bg-yellow-500 hover:bg-yellow-600' },
  { value: 1000, label: '1K', cls: 'bg-orange-400 hover:bg-orange-500' },
  { value: 1_000_000, label: '1M', cls: 'bg-orange-500 hover:bg-orange-600' },
  { value: 1_000_000_000, label: '1B', cls: 'bg-red-500 hover:bg-red-600' },
  { value: 1_000_000_000_000, label: '1T', cls: 'bg-red-600 hover:bg-red-700' },
  { value: 'infinity', label: '∞', cls: 'bg-purple-600 hover:bg-purple-700' },
];

const RANDOM_CHOICES: NValue[] = [
  3, 7, 12, 25, 64, 100, 144, 256, 1024, 2520, 9710, 1_000_000, 1_000_000_000, 'infinity',
];

export default function QuickJump({ current, onJump }: Props) {
  function step(delta: number) {
    if (current === 'infinity') return;
    onJump(Math.max(1, current + delta));
  }

  function random() {
    let pick = RANDOM_CHOICES[Math.floor(Math.random() * RANDOM_CHOICES.length)];
    if (pick === current) {
      pick = RANDOM_CHOICES[(RANDOM_CHOICES.indexOf(pick) + 1) % RANDOM_CHOICES.length];
    }
    onJump(pick);
  }

  return (
    <div className="bg-white rounded-2xl shadow p-3 space-y-2">
      <div className="text-xs text-gray-500 font-bold tracking-wide">JUMP TO</div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {JUMPS.map((j) => (
          <button
            key={String(j.value)}
            onClick={() => onJump(j.value)}
            className={`${j.cls} text-white rounded-lg py-2 text-sm font-bold`}
            aria-label={`Jump to ${j.label}`}
          >{j.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 text-sm">
        <button onClick={() => step(-100)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">−100</button>
        <button onClick={() => step(-10)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">−10</button>
        <button onClick={random} className="bg-pink-400 hover:bg-pink-500 text-white rounded-lg py-1.5 font-bold" aria-label="Random number">🎲</button>
        <button onClick={() => step(10)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">+10</button>
        <button onClick={() => step(100)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-1.5 font-semibold">+100</button>
      </div>
    </div>
  );
}
