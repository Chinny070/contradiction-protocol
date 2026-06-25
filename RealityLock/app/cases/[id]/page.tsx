'use client';

import { useState, useEffect, useReducer } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getCase,
  getCaseEvidenceIds,
  getEvidence,
  requestReview,
  submitAppeal,
  waitAndConfirm,
} from '@/lib/genlayer/contract';
import { parseVerdict } from '@/lib/realitylock/verdict';
import type { CaseRecord, EvidenceRecord, CanonicalVerdict, AppealBasis } from '@/lib/genlayer/types';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';
import CaseSealBar from '@/components/chamber/CaseSealBar';
import EvidenceRail from '@/components/chamber/EvidenceRail';
import ContradictionSpine from '@/components/chamber/ContradictionSpine';
import AgreementHeatmap from '@/components/chamber/AgreementHeatmap';
import CanonicalSeal from '@/components/chamber/CanonicalSeal';
import ValidatorTraceRail from '@/components/chamber/ValidatorTraceRail';
import ReviewProgress from '@/components/chamber/ReviewProgress';
import AppealDock from '@/components/chamber/AppealDock';
import SubmitEvidenceForm from '@/components/forms/SubmitEvidenceForm';

export default function CaseChamberPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [verdict, setVerdict] = useState<CanonicalVerdict | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [appealLoading, setAppealLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, refresh] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getCase(caseId);
        if (cancelled) return;
        if (!data) {
          setError('Case not found');
          return;
        }
        setCaseData(data);

        if (data.final_verdict_json) {
          const v = parseVerdict(data.final_verdict_json);
          setVerdict(v);
        }

        const evIds = await getCaseEvidenceIds(caseId);
        const evList: EvidenceRecord[] = [];
        for (const id of evIds) {
          const ev = await getEvidence(id);
          if (ev) evList.push(ev);
        }
        if (!cancelled) setEvidence(evList);
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caseId, refreshKey]);

  const handleReview = async () => {
    setReviewLoading(true);
    setError('');
    try {
      const result = await requestReview(caseId);
      if (result.status === 'error') {
        setError(result.error || 'Review request failed');
        setReviewLoading(false);
        return;
      }
      setTxHash(result.hash);
      if (result.hash) {
        await waitAndConfirm(result.hash);
      }
      refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAppeal = async (basis: AppealBasis, argument: string, newEvidenceRef: string) => {
    setAppealLoading(true);
    setError('');
    try {
      const appealId = `AP-${Date.now().toString(36).toUpperCase()}`;
      const result = await submitAppeal(caseId, appealId, basis, argument, newEvidenceRef);
      if (result.status === 'error') {
        setError(result.error || 'Appeal submission failed');
        return;
      }
      setTxHash(result.hash);
      if (result.hash) {
        await waitAndConfirm(result.hash);
      }
      refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setAppealLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--rl-violet)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm mt-4" style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}>
            Loading case...
          </p>
        </div>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--rl-red)', fontFamily: 'var(--font-ui)' }}>{error}</p>
          <Link href="/cases" className="text-sm underline" style={{ color: 'var(--rl-cyan)' }}>Back to Cases</Link>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  const canAppeal = caseData.status === 'VERDICT_ISSUED';
  const isReviewing = reviewLoading || caseData.status === 'REVIEW_PENDING';
  const hasVerdict = !!verdict;
  const canSubmitEvidence = !hasVerdict && !isReviewing;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--rl-border)', background: 'rgba(8,10,13,0.95)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rl-violet)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-base tracking-wide" style={{ color: '#fff', fontFamily: 'var(--font-display)' }}>
            RealityLock
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cases" className="text-sm" style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}>
            Cases
          </Link>
          <WalletConnectButton />
        </div>
      </nav>

      {/* Error banner */}
      {error && (
        <div
          className="mx-8 mt-4 p-3 rounded text-sm"
          style={{
            background: 'rgba(255,77,109,0.1)',
            color: 'var(--rl-red)',
            border: '1px solid rgba(255,77,109,0.3)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {error}
        </div>
      )}

      <main className="flex-1 px-8 py-6 max-w-[1400px] mx-auto w-full">
        {/* Case Seal Bar */}
        <CaseSealBar
          caseData={caseData}
          txHash={txHash}
          onRequestReview={handleReview}
          reviewLoading={reviewLoading}
        />

        {/* Review progress overlay */}
        {isReviewing && !hasVerdict && (
          <div className="mt-6">
            <ReviewProgress active={true} />
          </div>
        )}

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px] gap-6 mt-6">
          {/* LEFT: Evidence timeline + submit form */}
          <div className="space-y-4">
            <EvidenceRail
              evidence={evidence}
              decisiveIds={verdict?.decisive_evidence_ids}
            />
            <SubmitEvidenceForm
              caseId={caseId}
              onSubmitted={refresh}
              disabled={!canSubmitEvidence}
            />
          </div>

          {/* CENTER: Agreement Reconstruction */}
          <div className="space-y-6">
            <ContradictionSpine
              verdict={verdict}
              evidence={evidence}
              partyA={caseData.party_a}
              partyB={caseData.party_b}
            />
            <AgreementHeatmap verdict={verdict} />
          </div>

          {/* RIGHT: Canonical Verdict */}
          <div className="space-y-4">
            <CanonicalSeal
              verdict={verdict}
              rawJson={caseData.final_verdict_json}
              txHash={txHash}
            />
          </div>
        </div>

        {/* BOTTOM: Validator Trace + Appeal */}
        <div className="mt-6 space-y-4">
          <ValidatorTraceRail status={caseData.status} />
          <AppealDock
            canAppeal={canAppeal}
            onSubmitAppeal={handleAppeal}
            loading={appealLoading}
          />
        </div>
      </main>
    </div>
  );
}
