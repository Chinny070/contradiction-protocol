'use client';

import type { CanonicalVerdict, EvidenceRecord } from '@/lib/genlayer/types';

interface Props {
  verdict: CanonicalVerdict | null;
  evidence: EvidenceRecord[];
  partyA: string;
  partyB: string;
}

export default function ContradictionSpine({ verdict, evidence, partyA, partyB }: Props) {
  if (!verdict) {
    return (
      <div
        className="p-6 rounded-lg border text-center"
        style={{
          background: 'var(--rl-glass)',
          borderColor: 'var(--rl-border)',
          borderStyle: 'dashed',
        }}
      >
        <p
          className="text-sm"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
        >
          Agreement reconstruction will appear here after review.
        </p>
      </div>
    );
  }

  const allTerms = [
    ...verdict.confirmed_terms.map((t) => ({ term: t, state: 'confirmed' as const })),
    ...verdict.excluded_terms.map((t) => ({ term: t, state: 'excluded' as const })),
    ...verdict.changed_terms.map((t) => ({ term: t, state: 'changed' as const })),
    ...verdict.ambiguous_terms.map((t) => ({ term: t, state: 'ambiguous' as const })),
  ];

  const stateColors = {
    confirmed: 'var(--rl-green)',
    excluded: 'var(--rl-red)',
    changed: 'var(--rl-amber)',
    ambiguous: 'var(--rl-muted)',
  };

  const stateLabels = {
    confirmed: 'Confirmed',
    excluded: 'Excluded',
    changed: 'Changed',
    ambiguous: 'Ambiguous',
  };

  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-xs tracking-widest uppercase"
        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
      >
        Agreement Reconstruction
      </h3>

      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            color: 'var(--rl-cyan)',
            background: 'rgba(125,249,255,0.08)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {partyA}
        </span>
        <div
          className="flex-1 h-[1px] mx-4"
          style={{ background: 'var(--rl-border)' }}
        />
        <span
          className="text-xs px-2 py-1 rounded"
          style={{
            color: 'var(--rl-red)',
            background: 'rgba(255,77,109,0.08)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {partyB}
        </span>
      </div>

      <div className="relative">
        <div
          className="absolute left-1/2 top-0 bottom-0 w-[1px]"
          style={{ background: 'var(--rl-border)' }}
        />

        {allTerms.map((item, i) => {
          const color = stateColors[item.state];
          const isLeft = i % 2 === 0;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 mb-3 ${isLeft ? 'pr-[52%]' : 'pl-[52%]'}`}
            >
              <div
                className={`flex-1 p-3 rounded-lg border ${isLeft ? 'text-right' : 'text-left'}`}
                style={{
                  background: 'var(--rl-glass)',
                  borderColor: `${color}40`,
                }}
              >
                <div className="flex items-center gap-2" style={{ justifyContent: isLeft ? 'flex-end' : 'flex-start' }}>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded uppercase"
                    style={{
                      color,
                      background: `${color}15`,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {stateLabels[item.state]}
                  </span>
                </div>
                <p
                  className="text-sm mt-1"
                  style={{ color: '#e0e0e0', fontFamily: 'var(--font-ui)' }}
                >
                  {item.term}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {evidence.length > 0 && (
        <div className="mt-2">
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {evidence.length} evidence fragments analyzed
          </span>
        </div>
      )}
    </div>
  );
}
