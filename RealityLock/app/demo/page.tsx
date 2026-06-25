'use client';

import Link from 'next/link';
import { DEMO_CASE, DEMO_EVIDENCE, DEMO_VERDICT } from '@/lib/realitylock/demo-data';
import CaseSealBar from '@/components/chamber/CaseSealBar';
import EvidenceRail from '@/components/chamber/EvidenceRail';
import ContradictionSpine from '@/components/chamber/ContradictionSpine';
import AgreementHeatmap from '@/components/chamber/AgreementHeatmap';
import CanonicalSeal from '@/components/chamber/CanonicalSeal';
import ValidatorTraceRail from '@/components/chamber/ValidatorTraceRail';

export default function DemoPage() {
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
            href="/cases"
            className="text-sm"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
          >
            Cases
          </Link>
          <div
            className="px-3 py-1.5 rounded-md border text-xs"
            style={{
              borderColor: 'var(--rl-amber)',
              color: 'var(--rl-amber)',
              background: 'rgba(255,209,102,0.08)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            DEMO MODE
          </div>
        </div>
      </nav>

      <div
        className="px-8 py-3 border-b text-center"
        style={{
          background: 'rgba(255,209,102,0.05)',
          borderColor: 'rgba(255,209,102,0.2)',
        }}
      >
        <p
          className="text-xs"
          style={{ color: 'var(--rl-amber)', fontFamily: 'var(--font-ui)' }}
        >
          This is a static demo showing how RealityLock processes conflicting evidence into a canonical verdict.
          No contract interaction required.
        </p>
      </div>

      <main className="flex-1 px-8 py-6 max-w-[1400px] mx-auto w-full">
        <CaseSealBar caseData={DEMO_CASE} />

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] gap-6 mt-6">
          <div>
            <EvidenceRail
              evidence={DEMO_EVIDENCE}
              decisiveIds={DEMO_VERDICT.decisive_evidence_ids}
            />
          </div>

          <div className="space-y-6">
            <ContradictionSpine
              verdict={DEMO_VERDICT}
              evidence={DEMO_EVIDENCE}
              partyA={DEMO_CASE.party_a}
              partyB={DEMO_CASE.party_b}
            />
            <AgreementHeatmap verdict={DEMO_VERDICT} />
          </div>

          <div>
            <CanonicalSeal
              verdict={DEMO_VERDICT}
              rawJson={DEMO_CASE.final_verdict_json}
            />
          </div>
        </div>

        <div className="mt-6">
          <ValidatorTraceRail status={DEMO_CASE.status} />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/cases"
            className="px-8 py-3 rounded-lg text-sm font-medium inline-block"
            style={{
              background: 'rgba(125,249,255,0.12)',
              color: 'var(--rl-cyan)',
              border: '1px solid var(--rl-cyan)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Open Real Chamber
          </Link>
        </div>
      </main>
    </div>
  );
}
