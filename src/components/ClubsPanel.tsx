import type { NValue } from '../lib/types';
import { getClubs } from '../lib/clubs';

interface Props {
  n: NValue;
}

export default function ClubsPanel({ n }: Props) {
  const clubs = getClubs(n);
  const matchCount = clubs.filter((c) => c.match === true).length;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-base font-black text-gray-800 mb-3 flex items-center gap-2">
        🏆 <span>Clubs</span>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
          {matchCount}/{clubs.length}
        </span>
      </h2>
      <ul className="space-y-1.5">
        {clubs.map((c) => {
          const status = c.match === null ? '❓' : c.match ? '✅' : '—';
          const bg =
            c.match === true ? 'bg-green-50 border-green-200'
              : c.match === null ? 'bg-yellow-50 border-yellow-200'
                : 'bg-gray-50 border-gray-100 opacity-50';
          return (
            <li key={c.name} className={`flex items-center justify-between py-1.5 px-2 rounded-lg border ${bg}`}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <span className="font-bold text-sm text-gray-700">{c.label}</span>
                {!c.certain && c.match === null && (
                  <span className="text-[10px] text-yellow-700 ml-1">too big to verify</span>
                )}
              </span>
              <span className="text-sm">{status}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
