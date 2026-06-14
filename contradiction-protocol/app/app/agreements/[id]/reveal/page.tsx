'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAssumptionsForAgreement } from '@/lib/vault/localVault';
import { verifyCommitment } from '@/lib/commitments/hash';
import { Lock, Unlock, Eye, CheckCircle, XCircle, AlertTriangle, Shield, Plus, Trash2 } from 'lucide-react';
import type { PrivateAssumption, ResolutionAction } from '@/types';

const ACTIONS: { value: ResolutionAction; label: string }[] = [
  { value: 'CONTINUE', label: 'Continue Agreement' },
  { value: 'PAUSE', label: 'Pause Obligations' },
  { value: 'RENEGOTIATE', label: 'Renegotiate Terms' },
  { value: 'SETTLE_PARTIAL', label: 'Partial Settlement' },
  { value: 'SETTLE_FULL', label: 'Full Settlement' },
];

type EvidenceEntry = { title: string; type: string; url: string; summary: string };

const DEMO_ADDRESS = '0xdemo0000000000000000000000000000000000';

export default function RevealPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { address: walletAddress } = useAccount();
  // Use wallet address if connected, fall back to demo address so the flow
  // works without MetaMask in local demo mode.
  const address = walletAddress ?? DEMO_ADDRESS;

  const [mounted, setMounted] = useState(false);
  const [assumptions, setAssumptions] = useState<PrivateAssumption[]>([]);
  const [selected, setSelected] = useState<PrivateAssumption | null>(null);
  const [commitmentOk, setCommitmentOk] = useState<boolean | null>(null);
  const [requestedAction, setRequestedAction] = useState<ResolutionAction>('PAUSE');
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([{ title: '', type: 'URL', url: '', summary: '' }]);
  const [step, setStep] = useState<'select' | 'evidence' | 'preview' | 'submit'>('select');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    getAssumptionsForAgreement(id as string).then(setAssumptions);
  }, [id, mounted]);

  const selectAssumption = (a: PrivateAssumption) => {
    setSelected(a);
    const ok = verifyCommitment(a.normalisedText, a.salt, a.commitment);
    setCommitmentOk(ok);
  };

  const addEvidence = () => setEvidence(e => [...e, { title: '', type: 'URL', url: '', summary: '' }]);
  const removeEvidence = (i: number) => setEvidence(e => e.filter((_, idx) => idx !== i));
  const updateEvidence = (i: number, field: keyof EvidenceEntry, val: string) =>
    setEvidence(e => e.map((ev, idx) => idx === i ? { ...ev, [field]: val } : ev));

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      const revealId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const reveal = {
        id: revealId,
        agreementId: id,
        assumptionCommitment: selected.commitment,
        revealedAssumptionText: selected.normalisedText,
        salt: selected.salt,
        evidenceIds: [],
        requestedAction,
        status: 'SUBMITTED',
        createdBy: address,
        createdAt: Date.now(),
        evidence,
        verdictJson: null,
      };
      const existing = JSON.parse(localStorage.getItem('cp:reveals') || '[]');
      localStorage.setItem('cp:reveals', JSON.stringify([...existing, reveal]));
      router.push(`/app/reveals/${revealId}/review`);
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;
  if (assumptions.length === 0) {
    return (
      <EmptyState
        icon={<Shield className="w-12 h-12" />}
        title="No local assumptions found"
        description="This agreement's private assumptions are not in your local vault. They may have been created on another device."
        action={<Button variant="secondary" onClick={() => router.back()}>Go Back</Button>}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto slide-up space-y-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
          Reveal Assumption
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Select one private assumption to reveal. Everything else stays private.
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {['Select', 'Evidence', 'Preview', 'Submit'].map((label, i) => {
          const steps = ['select', 'evidence', 'preview', 'submit'];
          const active = steps[i] === step;
          const done = steps.indexOf(step) > i;
          return (
            <div key={label} className="flex items-center gap-2 flex-shrink-0">
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                active ? 'bg-[var(--accent)] text-white' : done ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'bg-[var(--border)] text-[var(--muted)]'
              }`}>
                {done ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>}
                {label}
              </div>
              {i < 3 && <div className="w-4 h-px bg-[var(--border)]" />}
            </div>
          );
        })}
      </div>

      {/* Step: Select */}
      {step === 'select' && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Select Affected Assumption</h2>
          {assumptions.map(a => (
            <Card
              key={a.localId}
              className={`p-4 cursor-pointer transition-all ${selected?.localId === a.localId ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'hover:border-[var(--muted)]'}`}
              onClick={() => selectAssumption(a)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected?.localId === a.localId ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]'}`}>
                  {selected?.localId === a.localId && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[var(--muted)]" />
                    <span className="text-sm font-medium">{a.title}</span>
                    <Badge variant="muted">{a.category}</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{a.normalisedText}</p>
                </div>
              </div>
            </Card>
          ))}

          {selected && commitmentOk !== null && (
            <Card className={`p-3 flex items-center gap-2 text-sm ${commitmentOk ? 'border-green-300 bg-green-50' : 'border-[var(--danger)] bg-[#f5dcd9]'}`}>
              {commitmentOk
                ? <><CheckCircle className="w-4 h-4 text-green-600" /> <span className="text-green-700">Commitment verified — hash matches original.</span></>
                : <><XCircle className="w-4 h-4 text-[var(--danger)]" /> <span className="text-[var(--danger)]">Commitment mismatch. Check your local vault.</span></>
              }
            </Card>
          )}

          <Button
            className="w-full"
            onClick={() => setStep('evidence')}
            disabled={!selected || !commitmentOk}
          >
            <Unlock className="w-3.5 h-3.5" />
            Confirm Selection
          </Button>
        </div>
      )}

      {/* Step: Evidence */}
      {step === 'evidence' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Add Evidence</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Provide evidence that the real-world condition has changed.
            </p>
          </div>

          <Select
            label="Requested action"
            options={ACTIONS}
            value={requestedAction}
            onChange={e => setRequestedAction(e.target.value as ResolutionAction)}
          />

          {evidence.map((ev, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">Evidence {i + 1}</span>
                {evidence.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeEvidence(i)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Input
                label="Title"
                placeholder="Port closure announcement"
                value={ev.title}
                onChange={e => updateEvidence(i, 'title', e.target.value)}
              />
              <Select
                label="Evidence type"
                options={[
                  { value: 'URL', label: 'URL / Web Reference' },
                  { value: 'TEXT_STATEMENT', label: 'Text Statement' },
                  { value: 'OFFICIAL_NOTICE', label: 'Official Notice' },
                  { value: 'DOCUMENT_HASH', label: 'Document Hash' },
                ]}
                value={ev.type}
                onChange={e => updateEvidence(i, 'type', e.target.value)}
              />
              {ev.type === 'URL' && (
                <Input
                  label="URL"
                  placeholder="https://..."
                  value={ev.url}
                  onChange={e => updateEvidence(i, 'url', e.target.value)}
                />
              )}
              <Textarea
                label="Summary / Why it matters"
                placeholder="Official notice confirms the port suspended inbound operations from July 15-31, during the delivery window."
                value={ev.summary}
                onChange={e => updateEvidence(i, 'summary', e.target.value)}
                rows={2}
              />
            </Card>
          ))}

          <Button variant="secondary" className="w-full" onClick={addEvidence}>
            <Plus className="w-3.5 h-3.5" />
            Add Evidence Item
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('select')}>Back</Button>
            <Button className="flex-1" onClick={() => setStep('preview')} disabled={evidence.some(e => !e.title || !e.summary)}>
              Preview Reveal
            </Button>
          </div>
        </div>
      )}

      {/* Step: Privacy Preview */}
      {step === 'preview' && selected && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Privacy Preview</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--accent)]">REVEALED</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Assumption text',
                  'Salt (proves membership)',
                  'Evidence submitted',
                  'Requested action',
                ].map(item => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                    <CheckCircle className="w-3 h-3 text-[var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Lock className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span className="text-xs font-semibold text-[var(--primary)]">STILL PRIVATE</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  'All other assumptions',
                  'Other assumption salts',
                  'Unrelated evidence',
                  'Private notes',
                ].map(item => (
                  <li key={item} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Lock className="w-3 h-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-xs font-semibold mb-2">Revealing:</h3>
            <p className="text-sm text-[var(--text)]">{selected.normalisedText}</p>
            <div className="mt-2">
              <span className="text-[10px] text-[var(--muted)] font-mono">commitment: </span>
              <span className="hash-text">{selected.commitment}</span>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('evidence')}>Back</Button>
            <Button className="flex-1" onClick={() => setStep('submit')}>
              <Eye className="w-3.5 h-3.5" />
              Proceed to Submit
            </Button>
          </div>
        </div>
      )}

      {/* Step: Submit */}
      {step === 'submit' && (
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">Submit Reveal to GenLayer</h2>

          <div className="p-3 rounded-lg bg-[var(--bg)] space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Assumption</span>
              <span className="font-medium">{selected?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Evidence items</span>
              <span className="font-medium">{evidence.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Requested action</span>
              <Badge variant="accent">{requestedAction}</Badge>
            </div>
          </div>

          <Card className="p-3 border-[var(--evidence-blue)] border">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--evidence-blue)] flex-shrink-0" />
              <p className="text-xs text-[var(--muted)]">
                Once submitted, the revealed assumption and evidence will be stored publicly on GenLayer for contradiction review.
                Your other assumptions remain private.
              </p>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('preview')}>Back</Button>
            <Button className="flex-1" loading={submitting} onClick={handleSubmit}>
              <Unlock className="w-3.5 h-3.5" />
              Sign & Submit Reveal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
