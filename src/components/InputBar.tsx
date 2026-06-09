import { useState, useEffect } from 'react';
import type { NValue } from '../lib/types';

interface Props {
  value: NValue;
  onChange: (n: NValue) => void;
}

function formatValue(v: NValue): string {
  return v === 'infinity' ? '∞' : v.toLocaleString('en-US');
}

export default function InputBar({ value, onChange }: Props) {
  const [draft, setDraft] = useState(formatValue(value));

  useEffect(() => {
    setDraft(formatValue(value));
  }, [value]);

  function commit() {
    const cleaned = draft.replace(/[,\s]/g, '').toLowerCase();
    if (cleaned === 'infinity' || cleaned === 'inf' || cleaned === '∞') {
      onChange('infinity');
      return;
    }
    const num = parseInt(cleaned, 10);
    if (Number.isFinite(num) && num >= 1) {
      onChange(Math.min(num, Number.MAX_SAFE_INTEGER));
    } else {
      setDraft(formatValue(value));
    }
  }

  function step(delta: number) {
    if (value === 'infinity') return;
    onChange(Math.max(1, value + delta));
  }

  return (
    <div className="bg-white rounded-2xl shadow p-3 flex items-center gap-2">
      <button
        onClick={() => step(-1)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl w-12 h-12 text-2xl font-bold"
        aria-label="Previous number"
      >−</button>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        onFocus={(e) => (e.target as HTMLInputElement).select()}
        className="flex-1 text-center text-3xl md:text-4xl font-black text-gray-800 outline-none bg-gray-50 rounded-xl py-2"
        aria-label="Number"
      />
      <button
        onClick={() => step(1)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl w-12 h-12 text-2xl font-bold"
        aria-label="Next number"
      >+</button>
    </div>
  );
}
