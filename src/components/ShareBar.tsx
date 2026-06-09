import { useState } from 'react';
import type { NValue } from '../lib/types';

interface Props {
  n: NValue;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function ShareBar({ n, canvasRef }: Props) {
  const [copyLabel, setCopyLabel] = useState('📋 Copy Link');

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLabel('✅ Copied!');
      setTimeout(() => setCopyLabel('📋 Copy Link'), 1500);
    } catch {
      setCopyLabel('Press ⌘C');
      setTimeout(() => setCopyLabel('📋 Copy Link'), 1500);
    }
  }

  function savePng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `numberblock-${n}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={copyLink}
        className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-bold"
      >{copyLabel}</button>
      <button
        onClick={savePng}
        className="bg-blue-400 hover:bg-blue-500 text-white rounded-xl py-3 font-bold"
      >💾 Save PNG</button>
    </div>
  );
}
