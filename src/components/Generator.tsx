import { useState, useRef, useEffect, useCallback } from 'react';
import type { NValue } from '../lib/types';
import { render } from '../lib/render';
import { fitCanvas } from '../lib/render-common';
import { parseN, serializeN } from '../lib/url-state';
import InputBar from './InputBar';
import QuickJump from './QuickJump';
import ClubsPanel from './ClubsPanel';
import ShareBar from './ShareBar';

function getInitialN(): NValue {
  if (typeof window === 'undefined') return 5;
  return parseN(new URLSearchParams(window.location.search).get('n'), 5);
}

export default function Generator() {
  const [n, setN] = useState<NValue>(getInitialN);
  const [overlay, setOverlay] = useState<{ label: string; sub: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(async (value: NValue) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rc = fitCanvas(canvas);
    const t0 = performance.now();
    try {
      const result = await render(rc, value);
      setOverlay(result.overlay);
      if (import.meta.env.DEV) {
        const dt = performance.now() - t0;
        console.debug(`[render] n=${value} tier=${result.tier} ${dt.toFixed(1)}ms`);
      }
    } catch (e) {
      console.error('render failed', e);
    }
  }, []);

  function setNumber(value: NValue) {
    setN(value);
    const params = new URLSearchParams(window.location.search);
    params.set('n', serializeN(value));
    window.history.replaceState(null, '', '?' + params.toString());
  }

  useEffect(() => {
    draw(n);
  }, [n, draw]);

  useEffect(() => {
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => draw(n), 100);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, [n, draw]);

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <section className="lg:col-span-2 space-y-3">
        <div
          className="relative rounded-2xl shadow-lg overflow-hidden"
          style={{
            aspectRatio: '4/3',
            background: 'linear-gradient(180deg, #B8E0FF 0%, #87CEEB 60%, #98D89E 60%, #7BC780 100%)',
          }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
          {overlay && (
            <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg pointer-events-none">
              <div className="text-center">
                <div
                  className="text-5xl md:text-8xl font-black"
                  style={{ textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}
                >{overlay.label}</div>
                <div className="text-base md:text-xl mt-2 font-bold">{overlay.sub}</div>
              </div>
            </div>
          )}
        </div>

        <InputBar value={n} onChange={setNumber} />
        <QuickJump current={n} onJump={setNumber} />
        <ShareBar n={n} canvasRef={canvasRef} />
      </section>

      <aside className="space-y-3">
        <ClubsPanel n={n} />
      </aside>
    </div>
  );
}
