'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CanonicalVerdict } from '@/lib/genlayer/types';
import { verdictLabel, confidenceColor } from '@/lib/realitylock/verdict';
import { explorerTxUrl } from '@/lib/genlayer/network';

interface Props {
  verdict: CanonicalVerdict | null;
  rawJson?: string;
  txHash?: string;
}

export default function CanonicalSeal({ verdict, rawJson, txHash }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!verdict) {
    return (
      <div
        className="p-8 rounded-lg border text-center relative overflow-hidden"
        style={{
          background: 'var(--rl-glass)',
          borderColor: 'var(--rl-border)',
          borderStyle: 'dashed',
        }}
      >
        <div
          className="w-20 h-20 mx-auto mb-5 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: 'var(--rl-muted)', borderStyle: 'dashed' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rl-muted)" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" strokeDasharray="4 2" />
          </svg>
        </div>
        <p
          className="text-base mb-1"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-display)' }}
        >
          Awaiting Verdict
        </p>
        <p
          className="text-xs"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)', opacity: 0.5 }}
        >
          Submit evidence and request review to seal the canonical agreement state
        </p>
      </div>
    );
  }

  const confColor = confidenceColor(verdict.confidence);

  const handleExport = () => {
    const json = rawJson || JSON.stringify(verdict, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verdict-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const json = rawJson
      ? (() => { try { return JSON.stringify(JSON.parse(rawJson), null, 2); } catch { return rawJson; } })()
      : JSON.stringify(verdict, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-lg border relative overflow-hidden"
      style={{
        background: 'var(--rl-glass)',
        borderColor: 'var(--rl-violet)',
        boxShadow: '0 0 30px rgba(155,92,255,0.06)',
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--rl-violet), transparent)',
        }}
      />

      {/* Seal header */}
      <div className="p-6 pb-4 text-center">
        <div
          className="w-20 h-20 mx-auto mb-4 rounded-full border-2 flex items-center justify-center relative"
          style={{ borderColor: 'var(--rl-violet)' }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(155,92,255,0.12) 0%, transparent 70%)' }}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rl-violet)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p
          className="text-xs tracking-[0.2em] uppercase mb-1"
          style={{ color: 'var(--rl-violet)', fontFamily: 'var(--font-mono)' }}
        >
          Reality Locked
        </p>
        <p
          className="text-lg"
          style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
        >
          {verdictLabel(verdict.verdict)}
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}>Confidence</span>
          <span className="text-sm font-semibold" style={{ color: confColor, fontFamily: 'var(--font-mono)' }}>
            {verdict.confidence}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}>Prevailing Party</span>
          <span className="text-sm" style={{ color: 'var(--rl-cyan)', fontFamily: 'var(--font-ui)' }}>
            {verdict.prevailing_party === 'party_a' ? 'Party A'
              : verdict.prevailing_party === 'party_b' ? 'Party B'
              : verdict.prevailing_party === 'mixed' ? 'Mixed' : 'None'}
          </span>
        </div>
      </div>

      {/* Agreed terms */}
      {verdict.confirmed_terms.length > 0 && (
        <div className="px-6 mt-4">
          <span className="text-[10px] uppercase tracking-[0.15em] block mb-2"
            style={{ color: 'var(--rl-green)', fontFamily: 'var(--font-mono)' }}>
            Confirmed
          </span>
          <div className="space-y-1">
            {verdict.confirmed_terms.map((t, i) => (
              <p key={i} className="text-sm" style={{ color: '#d0d0d0', fontFamily: 'var(--font-ui)' }}>
                {t}
              </p>
            ))}
          </div>
        </div>
      )}

      {verdict.excluded_terms.length > 0 && (
        <div className="px-6 mt-3">
          <span className="text-[10px] uppercase tracking-[0.15em] block mb-2"
            style={{ color: 'var(--rl-red)', fontFamily: 'var(--font-mono)' }}>
            Excluded
          </span>
          <div className="space-y-1">
            {verdict.excluded_terms.map((t, i) => (
              <p key={i} className="text-sm" style={{ color: '#d0d0d0', fontFamily: 'var(--font-ui)' }}>
                {t}
              </p>
            ))}
          </div>
        </div>
      )}

      {verdict.ambiguous_terms.length > 0 && (
        <div className="px-6 mt-3">
          <span className="text-[10px] uppercase tracking-[0.15em] block mb-2"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}>
            Ambiguous
          </span>
          <div className="space-y-1">
            {verdict.ambiguous_terms.map((t, i) => (
              <p key={i} className="text-sm" style={{ color: '#a0a0a0', fontFamily: 'var(--font-ui)' }}>
                {t}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Decisive evidence */}
      {verdict.decisive_evidence_ids.length > 0 && (
        <div className="px-6 mt-4 pt-3" style={{ borderTop: '1px solid var(--rl-border)' }}>
          <span className="text-[10px] uppercase tracking-[0.15em] block mb-2"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}>
            Decisive Evidence
          </span>
          <div className="flex flex-wrap gap-1.5">
            {verdict.decisive_evidence_ids.map((id) => (
              <span key={id} className="text-[10px] px-2 py-0.5 rounded"
                style={{ color: 'var(--rl-cyan)', background: 'rgba(125,249,255,0.08)', fontFamily: 'var(--font-mono)' }}>
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      {verdict.short_reason && (
        <div className="px-6 mt-4 pt-3" style={{ borderTop: '1px solid var(--rl-border)' }}>
          <span className="text-[10px] uppercase tracking-[0.15em] block mb-2"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}>
            Reasoning
          </span>
          <p className="text-sm italic leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--font-display)' }}>
            {verdict.short_reason}
          </p>
        </div>
      )}

      {/* Tx hash */}
      {txHash && (
        <div className="px-6 mt-3 pt-3" style={{ borderTop: '1px solid var(--rl-border)' }}>
          <a
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] break-all underline"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
          >
            tx: {txHash}
          </a>
        </div>
      )}

      {/* Raw JSON toggle */}
      <div className="px-6 mt-3">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-xs underline cursor-pointer"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {showRaw ? 'Hide' : 'Show'} Raw JSON
        </button>

        {showRaw && rawJson && (
          <div className="relative mt-2">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 text-[9px] px-2 py-1 rounded border"
              style={{
                borderColor: 'var(--rl-border)',
                color: copied ? 'var(--rl-green)' : 'var(--rl-muted)',
                background: 'rgba(0,0,0,0.5)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <pre
              className="p-3 rounded text-xs overflow-auto max-h-60"
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: 'var(--rl-cyan)',
                fontFamily: 'var(--font-mono)',
                border: '1px solid var(--rl-border)',
              }}
            >
              {(() => {
                try { return JSON.stringify(JSON.parse(rawJson), null, 2); }
                catch { return rawJson; }
              })()}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 pt-4 mt-3 space-y-2" style={{ borderTop: '1px solid var(--rl-border)' }}>
        <button
          onClick={handleExport}
          className="w-full p-2.5 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: 'transparent',
            borderColor: 'var(--rl-border)',
            color: 'var(--rl-muted)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Verdict
        </button>
        <Link
          href="/cases/new"
          className="w-full p-2.5 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: 'transparent',
            borderColor: 'var(--rl-border)',
            color: 'var(--rl-muted)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Case
        </Link>
      </div>
    </div>
  );
}
