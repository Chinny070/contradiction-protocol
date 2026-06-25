'use client';

import { useState } from 'react';
import type { AppealBasis } from '@/lib/genlayer/types';

interface Props {
  canAppeal: boolean;
  onSubmitAppeal: (basis: AppealBasis, argument: string, newEvidenceRef: string) => Promise<void>;
  loading?: boolean;
}

const APPEAL_BASES: { value: AppealBasis; label: string; description: string }[] = [
  { value: 'NEW_EVIDENCE', label: 'New Evidence', description: 'Previously unavailable evidence has surfaced' },
  { value: 'WRONG_INTERPRETATION', label: 'Wrong Interpretation', description: 'Evidence was misread or misinterpreted' },
  { value: 'MISSING_CONTRADICTION', label: 'Missing Contradiction', description: 'A key contradiction was not considered' },
  { value: 'FORGED_EVIDENCE', label: 'Forged Evidence', description: 'Submitted evidence may be unreliable or fabricated' },
  { value: 'TIMELINE_MISREAD', label: 'Timeline Misread', description: 'The chronological sequence was analyzed incorrectly' },
  { value: 'SCOPE_CHANGE_IGNORED', label: 'Scope Change Ignored', description: 'A scope modification was not accounted for' },
];

export default function AppealDock({ canAppeal, onSubmitAppeal, loading }: Props) {
  const [open, setOpen] = useState(false);
  const [basis, setBasis] = useState<AppealBasis | ''>('');
  const [argument, setArgument] = useState('');
  const [newEvidenceRef, setNewEvidenceRef] = useState('');

  if (!canAppeal) return null;

  const handleSubmit = async () => {
    if (!basis || !argument) return;
    await onSubmitAppeal(basis, argument, newEvidenceRef);
    setOpen(false);
    setBasis('');
    setArgument('');
    setNewEvidenceRef('');
  };

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        background: 'var(--rl-glass)',
        borderColor: 'var(--rl-border)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between text-left"
        style={{ fontFamily: 'var(--font-ui)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rl-red)" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--rl-red)' }}>
            Appeal Verdict
          </span>
        </div>
        <span style={{ color: 'var(--rl-muted)' }}>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-4">
          <div>
            <label
              className="text-[10px] uppercase tracking-wider block mb-2"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Appeal Basis
            </label>
            <div className="grid grid-cols-2 gap-2">
              {APPEAL_BASES.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBasis(b.value)}
                  className="p-2 rounded border text-left transition-all"
                  style={{
                    background: basis === b.value ? 'rgba(255,77,109,0.1)' : 'transparent',
                    borderColor: basis === b.value ? 'var(--rl-red)' : 'var(--rl-border)',
                  }}
                >
                  <span
                    className="text-xs block"
                    style={{
                      color: basis === b.value ? 'var(--rl-red)' : '#e0e0e0',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    {b.label}
                  </span>
                  <span
                    className="text-[10px] block mt-0.5"
                    style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
                  >
                    {b.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-[10px] uppercase tracking-wider block mb-2"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Argument
            </label>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full p-3 rounded border text-sm resize-none outline-none"
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderColor: 'var(--rl-border)',
                color: '#e0e0e0',
                fontFamily: 'var(--font-ui)',
              }}
              placeholder="Explain why the verdict should be reconsidered..."
            />
          </div>

          <div>
            <label
              className="text-[10px] uppercase tracking-wider block mb-2"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
            >
              New Evidence Reference (optional)
            </label>
            <input
              value={newEvidenceRef}
              onChange={(e) => setNewEvidenceRef(e.target.value)}
              maxLength={500}
              className="w-full p-3 rounded border text-sm outline-none"
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderColor: 'var(--rl-border)',
                color: '#e0e0e0',
                fontFamily: 'var(--font-mono)',
              }}
              placeholder="URL or reference to new evidence..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!basis || !argument || loading}
            className="w-full p-3 rounded border text-sm font-medium transition-all"
            style={{
              background: basis && argument ? 'rgba(255,77,109,0.15)' : 'transparent',
              borderColor: 'var(--rl-red)',
              color: 'var(--rl-red)',
              fontFamily: 'var(--font-ui)',
              opacity: !basis || !argument || loading ? 0.4 : 1,
            }}
          >
            {loading ? 'Submitting Appeal...' : 'Submit Appeal'}
          </button>
        </div>
      )}
    </div>
  );
}
