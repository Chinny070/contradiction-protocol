'use client';

import { useState } from 'react';
import { submitEvidence } from '@/lib/genlayer/contract';
import { explorerTxUrl } from '@/lib/genlayer/network';
import type { EvidenceType } from '@/lib/genlayer/types';

interface Props {
  caseId: string;
  onSubmitted?: () => void;
  disabled?: boolean;
}

const EVIDENCE_TYPES: { value: EvidenceType; label: string; icon: string }[] = [
  { value: 'TEXT', label: 'Text', icon: '📝' },
  { value: 'CHAT_LOG', label: 'Chat Log', icon: '💬' },
  { value: 'SCREENSHOT_URL', label: 'Screenshot', icon: '🖼️' },
  { value: 'PDF_URL', label: 'PDF', icon: '📄' },
  { value: 'EMAIL_EXCERPT', label: 'Email', icon: '📧' },
  { value: 'GITHUB_COMMIT', label: 'GitHub', icon: '🔗' },
  { value: 'OTHER_URL', label: 'URL', icon: '🌐' },
  { value: 'VIDEO_URL', label: 'Notes', icon: '📋' },
];

export default function SubmitEvidenceForm({ caseId, onSubmitted, disabled }: Props) {
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('TEXT');
  const [title, setTitle] = useState('');
  const [contentRef, setContentRef] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const generateId = () => `EV-${Date.now().toString(36).toUpperCase()}`;

  const reset = () => {
    setTitle('');
    setContentRef('');
    setExcerpt('');
    setClaim('');
    setTxHash('');
    setError('');
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTxHash('');

    if (!title.trim()) { setError('Evidence title is required'); return; }
    if (!claim.trim()) { setError('Claim is required — what does this evidence prove?'); return; }

    setLoading(true);
    try {
      const evidenceId = generateId();
      const now = new Date().toISOString().split('T')[0];
      const result = await submitEvidence(
        caseId, evidenceId, evidenceType, title, contentRef, excerpt, claim, now
      );

      if (result.status === 'error') {
        setError(result.error || 'Transaction failed');
        return;
      }

      setTxHash(result.hash);
      setSubmitted(true);
      onSubmitted?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(0,0,0,0.3)',
    borderColor: 'var(--rl-border)',
    color: '#e0e0e0',
    fontFamily: 'var(--font-ui)',
  };

  const labelClass = "text-[10px] uppercase tracking-[0.15em] block mb-2";
  const labelStyle = { color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' as const };

  if (submitted && txHash) {
    return (
      <div
        className="p-5 rounded-lg border text-center space-y-3"
        style={{ background: 'var(--rl-glass)', borderColor: 'rgba(84,242,166,0.25)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rl-green)" strokeWidth="2.5" className="mx-auto">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--rl-green)', fontFamily: 'var(--font-ui)' }}>
          Evidence submitted
        </p>
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline inline-block"
          style={{ color: 'var(--rl-cyan)', fontFamily: 'var(--font-mono)' }}
        >
          View transaction
        </a>
        <div className="pt-1">
          <button
            onClick={reset}
            className="text-xs underline"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
          >
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--rl-glass)', borderColor: 'var(--rl-border)' }}
    >
      <div className="p-4 pb-0">
        <h3
          className="text-[10px] uppercase tracking-[0.15em] mb-4"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          Submit Evidence
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4">
        {/* Type selector */}
        <div>
          <label className={labelClass} style={labelStyle}>Type</label>
          <div className="grid grid-cols-4 gap-1.5">
            {EVIDENCE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setEvidenceType(t.value)}
                disabled={disabled}
                className="p-2 rounded border text-center transition-all"
                style={{
                  background: evidenceType === t.value ? 'rgba(125,249,255,0.08)' : 'transparent',
                  borderColor: evidenceType === t.value ? 'var(--rl-cyan)' : 'var(--rl-border)',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <span className="text-sm block">{t.icon}</span>
                <span
                  className="text-[9px] block mt-0.5"
                  style={{
                    color: evidenceType === t.value ? 'var(--rl-cyan)' : 'var(--rl-muted)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            disabled={disabled}
            className="w-full p-3 rounded border text-sm outline-none"
            style={inputStyle}
            placeholder="Brief title for this evidence"
          />
        </div>

        {(evidenceType !== 'TEXT' && evidenceType !== 'CHAT_LOG' && evidenceType !== 'EMAIL_EXCERPT') && (
          <div>
            <label className={labelClass} style={labelStyle}>URL / Reference</label>
            <input
              value={contentRef}
              onChange={(e) => setContentRef(e.target.value)}
              maxLength={500}
              disabled={disabled}
              className="w-full p-3 rounded border text-sm outline-none"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              placeholder="https://..."
            />
          </div>
        )}

        <div>
          <label className={labelClass} style={labelStyle}>
            {evidenceType === 'GITHUB_COMMIT' ? 'Commit Message / Description' :
             evidenceType === 'SCREENSHOT_URL' ? 'Description of Screenshot' :
             'Excerpt / Content'}
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={1000}
            rows={3}
            disabled={disabled}
            className="w-full p-3 rounded border text-sm resize-none outline-none"
            style={inputStyle}
            placeholder="Paste the relevant content or describe the evidence..."
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>What does this prove?</label>
          <input
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            maxLength={500}
            disabled={disabled}
            className="w-full p-3 rounded border text-sm outline-none"
            style={inputStyle}
            placeholder="e.g., Dashboard was excluded from scope"
          />
        </div>

        {error && (
          <div
            className="p-3 rounded text-sm"
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

        <button
          type="submit"
          disabled={loading || disabled}
          className="w-full p-3 rounded-md border text-sm font-medium transition-all"
          style={{
            background: loading ? 'rgba(125,249,255,0.05)' : 'rgba(125,249,255,0.1)',
            borderColor: 'var(--rl-cyan)',
            color: 'var(--rl-cyan)',
            fontFamily: 'var(--font-ui)',
            opacity: loading || disabled ? 0.5 : 1,
          }}
        >
          {loading ? 'Submitting...' : 'Submit Evidence'}
        </button>
      </form>
    </div>
  );
}
