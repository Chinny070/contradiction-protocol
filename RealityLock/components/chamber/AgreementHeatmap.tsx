'use client';

import type { CanonicalVerdict } from '@/lib/genlayer/types';

interface Props {
  verdict: CanonicalVerdict | null;
}

interface TermRow {
  term: string;
  state: string;
  color: string;
}

export default function AgreementHeatmap({ verdict }: Props) {
  if (!verdict) return null;

  const rows: TermRow[] = [
    ...verdict.confirmed_terms.map((t) => ({
      term: t,
      state: 'Confirmed',
      color: 'var(--rl-green)',
    })),
    ...verdict.excluded_terms.map((t) => ({
      term: t,
      state: 'Excluded',
      color: 'var(--rl-red)',
    })),
    ...verdict.changed_terms.map((t) => ({
      term: t,
      state: 'Changed',
      color: 'var(--rl-amber)',
    })),
    ...verdict.ambiguous_terms.map((t) => ({
      term: t,
      state: 'Ambiguous',
      color: 'var(--rl-muted)',
    })),
  ];

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3
        className="text-xs tracking-widest uppercase mb-1"
        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
      >
        Agreement Heatmap
      </h3>

      <div
        className="rounded-lg border overflow-hidden"
        style={{
          background: 'var(--rl-glass)',
          borderColor: 'var(--rl-border)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--rl-border)',
              }}
            >
              <th
                className="text-left text-[10px] tracking-wider uppercase px-4 py-2"
                style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
              >
                Term
              </th>
              <th
                className="text-left text-[10px] tracking-wider uppercase px-4 py-2"
                style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
              >
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <td
                  className="px-4 py-2.5 text-sm"
                  style={{ color: '#e0e0e0', fontFamily: 'var(--font-ui)' }}
                >
                  {row.term}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      color: row.color,
                      background: `${row.color}15`,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {row.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
