'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCases } from '@/lib/genlayer/contract';
import type { CaseRecord } from '@/lib/genlayer/types';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'var(--rl-cyan)',
  EVIDENCE_SUBMITTED: 'var(--rl-amber)',
  REVIEW_PENDING: 'var(--rl-violet)',
  VERDICT_ISSUED: 'var(--rl-green)',
  APPEALED: 'var(--rl-red)',
  APPEAL_RESOLVED: 'var(--rl-muted)',
};

export default function CasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAllCases();
        if (!cancelled) setCases(data);
      } catch {
        // contract may not be deployed yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = filter
    ? cases.filter((c) => c.status === filter)
    : cases;

  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className="flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: 'var(--rl-border)', background: 'rgba(8,10,13,0.9)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rl-violet)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              className="text-lg font-semibold tracking-wider"
              style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
            >
              RealityLock
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="text-sm"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
          >
            Demo
          </Link>
          <WalletConnectButton />
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl"
            style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
          >
            Case Chamber
          </h1>
          <Link
            href="/cases/new"
            className="px-6 py-2.5 rounded-md text-sm font-medium border transition-all"
            style={{
              background: 'rgba(125,249,255,0.1)',
              borderColor: 'var(--rl-cyan)',
              color: 'var(--rl-cyan)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            + Create Case
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {['', 'OPEN', 'EVIDENCE_SUBMITTED', 'REVIEW_PENDING', 'VERDICT_ISSUED', 'APPEALED'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded text-xs transition-all"
                style={{
                  background: filter === s ? 'rgba(125,249,255,0.1)' : 'transparent',
                  border: `1px solid ${filter === s ? 'var(--rl-cyan)' : 'var(--rl-border)'}`,
                  color: filter === s ? 'var(--rl-cyan)' : 'var(--rl-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {s || 'All'}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div
              className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--rl-violet)', borderTopColor: 'transparent' }}
            />
            <p
              className="text-sm mt-4"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
            >
              Loading cases...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 rounded-lg border"
            style={{
              background: 'var(--rl-glass)',
              borderColor: 'var(--rl-border)',
              borderStyle: 'dashed',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--rl-muted)"
              strokeWidth="1"
              className="mx-auto mb-4"
              style={{ opacity: 0.4 }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" strokeDasharray="4 2" />
            </svg>
            <p
              className="text-sm mb-2"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
            >
              No cases found
            </p>
            <p
              className="text-xs mb-6"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)', opacity: 0.6 }}
            >
              Create a case to start resolving agreement disputes
            </p>
            <Link
              href="/cases/new"
              className="px-6 py-2.5 rounded-md text-sm border inline-block"
              style={{
                borderColor: 'var(--rl-cyan)',
                color: 'var(--rl-cyan)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              Create First Case
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((c) => {
              const sColor = STATUS_COLORS[c.status] || 'var(--rl-muted)';
              return (
                <Link
                  key={c.case_id}
                  href={`/cases/${c.case_id}`}
                  className="p-5 rounded-lg border transition-all block"
                  style={{
                    background: 'var(--rl-glass)',
                    borderColor: 'var(--rl-border)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className="text-[10px] tracking-widest uppercase"
                        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        {c.case_id}
                      </span>
                      <h3
                        className="text-base mt-1"
                        style={{ color: '#fff', fontFamily: 'var(--font-ui)' }}
                      >
                        {c.title}
                      </h3>
                      <p
                        className="text-xs mt-2"
                        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
                      >
                        {c.party_a} <span style={{ color: 'var(--rl-red)' }}>vs</span> {c.party_b}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        {c.evidence_count} evidence
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider"
                        style={{
                          color: sColor,
                          background: `${sColor}15`,
                          border: `1px solid ${sColor}30`,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
