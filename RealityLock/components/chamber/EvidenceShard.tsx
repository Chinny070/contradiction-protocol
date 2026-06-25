'use client';

import type { EvidenceRecord } from '@/lib/genlayer/types';

interface Props {
  evidence: EvidenceRecord;
  decisiveIds?: string[];
}

const TYPE_ICONS: Record<string, string> = {
  TEXT: '📝',
  SCREENSHOT_URL: '🖼️',
  PDF_URL: '📄',
  CHAT_LOG: '💬',
  EMAIL_EXCERPT: '📧',
  GITHUB_COMMIT: '🔗',
  VIDEO_URL: '🎥',
  OTHER_URL: '🔗',
};

export default function EvidenceShard({ evidence, decisiveIds = [] }: Props) {
  const isDecisive = decisiveIds.includes(evidence.evidence_id);

  return (
    <div
      className="p-4 rounded-lg border relative overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--rl-glass)',
        borderColor: isDecisive ? 'var(--rl-cyan)' : 'var(--rl-border)',
        boxShadow: isDecisive ? '0 0 20px rgba(125,249,255,0.1)' : 'none',
      }}
    >
      {isDecisive && (
        <div
          className="absolute top-0 left-0 w-full h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--rl-cyan), transparent)',
          }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{TYPE_ICONS[evidence.evidence_type] || '📎'}</span>
          <span
            className="text-xs tracking-wider uppercase"
            style={{
              color: 'var(--rl-cyan)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {evidence.evidence_id}
          </span>
          {isDecisive && (
            <span
              className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider"
              style={{
                color: 'var(--rl-cyan)',
                background: 'rgba(125,249,255,0.1)',
                border: '1px solid rgba(125,249,255,0.3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Decisive
            </span>
          )}
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded uppercase"
          style={{
            color: 'var(--rl-muted)',
            background: 'rgba(142,153,168,0.1)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {evidence.evidence_type.replace(/_/g, ' ')}
        </span>
      </div>

      <h4
        className="text-sm font-medium mb-2"
        style={{ color: '#fff', fontFamily: 'var(--font-ui)' }}
      >
        {evidence.title}
      </h4>

      {evidence.excerpt && (
        <div
          className="p-3 rounded mb-3 text-sm italic"
          style={{
            background: 'rgba(0,0,0,0.3)',
            color: 'var(--rl-muted)',
            borderLeft: '3px solid var(--rl-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}
        >
          &ldquo;{evidence.excerpt}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between">
        <p
          className="text-xs"
          style={{ color: 'var(--rl-amber)', fontFamily: 'var(--font-ui)' }}
        >
          Claim: {evidence.claim}
        </p>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span
          className="text-[10px]"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {evidence.submitter.slice(0, 8)}...{evidence.submitter.slice(-4)}
        </span>
        {evidence.submitted_at_note && (
          <span
            className="text-[10px]"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {evidence.submitted_at_note}
          </span>
        )}
      </div>
    </div>
  );
}
