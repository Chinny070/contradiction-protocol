'use client';

import type { CaseStatus } from '@/lib/genlayer/types';

interface Props {
  status: CaseStatus;
  txHashes?: Record<string, string>;
}

const LIFECYCLE_STEPS = [
  { key: 'OPEN', label: 'Case Created' },
  { key: 'EVIDENCE_SUBMITTED', label: 'Evidence Submitted' },
  { key: 'REVIEW_PENDING', label: 'Review Requested' },
  { key: 'VERDICT_ISSUED', label: 'Verdict Issued' },
  { key: 'APPEALED', label: 'Appeal Opened' },
  { key: 'APPEAL_RESOLVED', label: 'Appeal Resolved' },
] as const;

const STATUS_ORDER: Record<CaseStatus, number> = {
  OPEN: 0,
  EVIDENCE_SUBMITTED: 1,
  REVIEW_PENDING: 2,
  VERDICT_ISSUED: 3,
  APPEALED: 4,
  APPEAL_RESOLVED: 5,
};

export default function ValidatorTraceRail({ status }: Props) {
  const currentIndex = STATUS_ORDER[status];

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: 'var(--rl-glass)',
        borderColor: 'var(--rl-border)',
      }}
    >
      <h3
        className="text-xs tracking-widest uppercase mb-4"
        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
      >
        Validator Trace
      </h3>

      <div className="flex items-center gap-1">
        {LIFECYCLE_STEPS.map((step, i) => {
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const color = isCompleted ? 'var(--rl-cyan)' : 'var(--rl-border)';

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-3 h-3 rounded-full mb-1 transition-all duration-300"
                  style={{
                    background: isCompleted ? color : 'transparent',
                    border: `2px solid ${color}`,
                    boxShadow: isCurrent ? `0 0 8px ${color}` : 'none',
                  }}
                />
                <span
                  className="text-[9px] text-center leading-tight"
                  style={{
                    color: isCompleted ? 'var(--rl-cyan)' : 'var(--rl-muted)',
                    fontFamily: 'var(--font-mono)',
                    opacity: isCompleted ? 1 : 0.4,
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div
                  className="h-[1px] w-full mt-[-14px]"
                  style={{
                    background: i < currentIndex ? 'var(--rl-cyan)' : 'var(--rl-border)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
