'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCase } from '@/lib/genlayer/contract';
import { explorerTxUrl } from '@/lib/genlayer/network';

export default function CreateCaseForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [disputed, setDisputed] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [createdCaseId, setCreatedCaseId] = useState('');

  const generateId = () => `CASE-${Date.now().toString(36).toUpperCase()}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTxHash('');

    if (!title.trim()) { setError('Case title is required'); return; }
    if (!summary.trim()) { setError('Agreement summary is required'); return; }
    if (!partyA.trim()) { setError('Party A is required'); return; }
    if (!partyB.trim()) { setError('Party B is required'); return; }
    if (!disputed.trim()) { setError('Describe what is being disputed'); return; }

    setLoading(true);
    try {
      const caseId = generateId();
      setCreatedCaseId(caseId);
      const fullSummary = `${summary}\n\nDisputed: ${disputed}${deadline ? `\nDeadline: ${deadline}` : ''}`;
      const now = new Date().toISOString().split('T')[0];
      const result = await createCase(caseId, title, fullSummary, partyA, partyB, now);

      if (result.status === 'error') {
        setError(result.error || 'Transaction failed');
        return;
      }

      setTxHash(result.hash);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass} style={labelStyle}>Case Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full p-3 rounded border text-sm outline-none"
          style={inputStyle}
          placeholder="e.g., Login and Dashboard Scope Dispute"
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Agreement Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full p-3 rounded border text-sm resize-none outline-none"
          style={inputStyle}
          placeholder="Describe the original agreement between the parties..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>Party A</label>
          <input
            value={partyA}
            onChange={(e) => setPartyA(e.target.value)}
            maxLength={200}
            className="w-full p-3 rounded border text-sm outline-none"
            style={inputStyle}
            placeholder="e.g., Developer"
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Party B</label>
          <input
            value={partyB}
            onChange={(e) => setPartyB(e.target.value)}
            maxLength={200}
            className="w-full p-3 rounded border text-sm outline-none"
            style={inputStyle}
            placeholder="e.g., Client"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>What Is Disputed</label>
        <textarea
          value={disputed}
          onChange={(e) => setDisputed(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full p-3 rounded border text-sm resize-none outline-none"
          style={inputStyle}
          placeholder="What specific terms, deliverables, or commitments are in conflict?"
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>
          Deadline <span style={{ opacity: 0.5 }}>(optional)</span>
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full p-3 rounded border text-sm outline-none"
          style={{ ...inputStyle, colorScheme: 'dark' }}
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

      {txHash && (
        <div
          className="p-5 rounded-lg text-center space-y-3"
          style={{
            background: 'rgba(84,242,166,0.06)',
            border: '1px solid rgba(84,242,166,0.25)',
          }}
        >
          <div
            className="w-12 h-12 mx-auto rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: 'var(--rl-green)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rl-green)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm" style={{ color: 'var(--rl-green)', fontFamily: 'var(--font-ui)' }}>
            Case created
          </p>
          <p className="text-xs" style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}>
            {createdCaseId}
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
          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push(`/cases/${createdCaseId}`)}
              className="px-6 py-2.5 rounded-md text-sm font-medium border transition-all"
              style={{
                background: 'rgba(125,249,255,0.1)',
                borderColor: 'var(--rl-cyan)',
                color: 'var(--rl-cyan)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              Open Evidence Chamber
            </button>
          </div>
        </div>
      )}

      {!txHash && (
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3.5 rounded-md border text-sm font-medium transition-all"
          style={{
            background: loading ? 'rgba(125,249,255,0.05)' : 'rgba(125,249,255,0.1)',
            borderColor: 'var(--rl-cyan)',
            color: 'var(--rl-cyan)',
            fontFamily: 'var(--font-ui)',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Creating Case...' : 'Create Case'}
        </button>
      )}
    </form>
  );
}
