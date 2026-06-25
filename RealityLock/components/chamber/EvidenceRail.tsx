'use client';

import type { EvidenceRecord } from '@/lib/genlayer/types';

interface Props {
  evidence: EvidenceRecord[];
  decisiveIds?: string[];
}

const TYPE_ICONS: Record<string, string> = {
  TEXT: '📝',
  SCREENSHOT_URL: '🖼️',
  PDF_URL: '📄',
  CHAT_LOG: '💬',
  EMAIL_EXCERPT: '📧',
  GITHUB_COMMIT: '🔗',
  VIDEO_URL: '📋',
  OTHER_URL: '🌐',
};

export default function EvidenceRail({ evidence, decisiveIds = [] }: Props) {
  if (evidence.length === 0) {
    return (
      <div
        className="p-8 rounded-lg border text-center"
        style={{
          background: 'var(--rl-glass)',
          borderColor: 'var(--rl-border)',
          borderStyle: 'dashed',
        }}
      >
        <p
          className="text-sm mb-1"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
        >
          No evidence yet
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)', opacity: 0.5 }}
        >
          Submit evidence below to build the case
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Evidence Timeline
        </h3>
        <span
          className="text-[10px]"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {evidence.length} item{evidence.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[15px] top-2 bottom-2 w-[1px]"
          style={{ background: 'var(--rl-border)' }}
        />

        <div className="space-y-3">
          {evidence.map((ev) => {
            const isDecisive = decisiveIds.includes(ev.evidence_id);
            const dotColor = isDecisive ? 'var(--rl-cyan)' : 'var(--rl-muted)';

            return (
              <div key={ev.evidence_id} className="flex gap-3 relative">
                {/* Dot */}
                <div className="flex-shrink-0 w-[30px] flex justify-center pt-3 relative z-10">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: dotColor,
                      boxShadow: isDecisive ? `0 0 8px ${dotColor}` : 'none',
                    }}
                  />
                </div>

                {/* Card */}
                <div
                  className="flex-1 p-3.5 rounded-lg border transition-all"
                  style={{
                    background: 'var(--rl-glass)',
                    borderColor: isDecisive ? 'rgba(125,249,255,0.3)' : 'var(--rl-border)',
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{TYPE_ICONS[ev.evidence_type] || '📎'}</span>
                      <span
                        className="text-[10px] tracking-wider uppercase"
                        style={{ color: 'var(--rl-cyan)', fontFamily: 'var(--font-mono)' }}
                      >
                        {ev.evidence_id}
                      </span>
                      {isDecisive && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            color: 'var(--rl-cyan)',
                            background: 'rgba(125,249,255,0.1)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          Decisive
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                      style={{
                        color: 'var(--rl-muted)',
                        background: 'rgba(142,153,168,0.08)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {ev.evidence_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <p
                    className="text-sm mb-1.5"
                    style={{ color: '#e0e0e0', fontFamily: 'var(--font-ui)' }}
                  >
                    {ev.title}
                  </p>

                  {/* Excerpt */}
                  {ev.excerpt && (
                    <div
                      className="p-2.5 rounded mb-2 text-xs italic"
                      style={{
                        background: 'rgba(0,0,0,0.25)',
                        color: 'rgba(255,255,255,0.5)',
                        borderLeft: '2px solid var(--rl-border)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        lineHeight: '1.5',
                      }}
                    >
                      &ldquo;{ev.excerpt}&rdquo;
                    </div>
                  )}

                  {/* Claim */}
                  <p
                    className="text-xs mb-2"
                    style={{ color: 'var(--rl-amber)', fontFamily: 'var(--font-ui)' }}
                  >
                    {ev.claim}
                  </p>

                  {/* Footer: submitter + timestamp */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px]"
                      style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}
                    >
                      {ev.submitter.slice(0, 6)}...{ev.submitter.slice(-4)}
                    </span>
                    {ev.submitted_at_note && (
                      <span
                        className="text-[9px]"
                        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)', opacity: 0.7 }}
                      >
                        {ev.submitted_at_note}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
