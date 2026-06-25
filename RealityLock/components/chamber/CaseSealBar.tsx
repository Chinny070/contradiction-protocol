'use client';

import type { CaseRecord } from '@/lib/genlayer/types';
import { explorerTxUrl } from '@/lib/genlayer/network';

interface Props {
  caseData: CaseRecord;
  txHash?: string;
  onRequestReview?: () => void;
  reviewLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'var(--rl-cyan)',
  EVIDENCE_SUBMITTED: 'var(--rl-amber)',
  REVIEW_PENDING: 'var(--rl-violet)',
  VERDICT_ISSUED: 'var(--rl-green)',
  APPEALED: 'var(--rl-red)',
  APPEAL_RESOLVED: 'var(--rl-muted)',
};

export default function CaseSealBar({ caseData, txHash, onRequestReview, reviewLoading }: Props) {
  const statusColor = STATUS_COLORS[caseData.status] || 'var(--rl-muted)';
  const canReview = caseData.status === 'EVIDENCE_SUBMITTED' || caseData.status === 'OPEN';

  return (
    <div
      className="w-full p-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border"
      style={{
        background: 'var(--rl-glass)',
        borderColor: 'var(--rl-border)',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {caseData.case_id}
        </span>
        <h2
          className="text-lg font-semibold"
          style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
        >
          {caseData.title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-1 rounded uppercase tracking-wider"
            style={{
              color: statusColor,
              background: `${statusColor}15`,
              border: `1px solid ${statusColor}30`,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {caseData.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div
          className="text-xs"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
        >
          <span>{caseData.party_a}</span>
          <span className="mx-2" style={{ color: 'var(--rl-red)' }}>vs</span>
          <span>{caseData.party_b}</span>
        </div>

        {txHash && (
          <a
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline"
            style={{ color: 'var(--rl-cyan)', fontFamily: 'var(--font-mono)' }}
          >
            tx:{txHash.slice(0, 8)}...
          </a>
        )}

        {onRequestReview && canReview && caseData.evidence_count > 0 && (
          <button
            onClick={onRequestReview}
            disabled={reviewLoading}
            className="px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200"
            style={{
              background: reviewLoading ? 'rgba(155,92,255,0.1)' : 'rgba(155,92,255,0.2)',
              borderColor: 'var(--rl-violet)',
              color: 'var(--rl-violet)',
              fontFamily: 'var(--font-ui)',
              opacity: reviewLoading ? 0.6 : 1,
            }}
          >
            {reviewLoading ? 'Reviewing...' : 'Request Review'}
          </button>
        )}
      </div>
    </div>
  );
}
