'use client';
import { useState, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  generateSalt
} from '@/lib/commitments/salts';
import { createAssumptionCommitment, createAssumptionsRoot, createAgreementRoot } from '@/lib/commitments/hash';
import { normaliseAssumption } from '@/lib/commitments/normalise';
import { saveAssumption } from '@/lib/vault/localVault';
import { Plus, Trash2, Lock, Eye, Hash, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import type { PrivateAssumption, AssumptionCategory, ResolutionAction } from '@/types';
import { DEMO_MODE, DEMO_ADDRESS } from '@/lib/config/demo';
import { saveAgreement } from '@/lib/firebase/agreements';
import { glCreateAgreement } from '@/lib/genlayer/writes';

const CATEGORIES: { value: AssumptionCategory; label: string }[] = [
  { value: 'MARKET_PRICE', label: 'Market Price' },
  { value: 'REGULATION', label: 'Regulation' },
  { value: 'DELIVERY_CONDITION', label: 'Delivery Condition' },
  { value: 'ACCESS_CONDITION', label: 'Access Condition' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'SUPPLIER_CAPACITY', label: 'Supplier Capacity' },
  { value: 'PAYMENT_CONDITION', label: 'Payment Condition' },
  { value: 'WEATHER_OR_FORCE_MAJEURE', label: 'Weather / Force Majeure' },
  { value: 'OTHER', label: 'Other' },
];

const REMEDIES: { value: ResolutionAction; label: string }[] = [
  { value: 'CONTINUE', label: 'Continue Agreement' },
  { value: 'PAUSE', label: 'Pause Obligations' },
  { value: 'RENEGOTIATE', label: 'Renegotiate Terms' },
  { value: 'SETTLE_PARTIAL', label: 'Partial Settlement' },
  { value: 'SETTLE_FULL', label: 'Full Settlement' },
];

type AssumptionDraft = {
  title: string;
  category: AssumptionCategory;
  text: string;
  triggerCondition: string;
  expectedState: string;
  materialityThreshold: string;
  preferredRemedy: ResolutionAction;
};

function emptyDraft(): AssumptionDraft {
  return {
    title: '',
    category: 'DELIVERY_CONDITION',
    text: '',
    triggerCondition: '',
    expectedState: '',
    materialityThreshold: '',
    preferredRemedy: 'PAUSE',
  };
}

type Step = 'parties' | 'summary' | 'assumptions' | 'preview' | 'submit';
const STEPS: Step[] = ['parties', 'summary', 'assumptions', 'preview', 'submit'];

export default function NewAgreementPage() {
  const { address: walletAddress } = useAccount();
  const address = walletAddress ?? (DEMO_MODE ? DEMO_ADDRESS : '');
  const router = useRouter();

  const [step, setStep] = useState<Step>('parties');
  const [counterparty, setCounterparty] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [assumptions, setAssumptions] = useState<AssumptionDraft[]>([emptyDraft()]);
  const [expandedIdx, setExpandedIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submitGuard = useRef(false);

  const stepIdx = STEPS.indexOf(step);

  const addAssumption = () => {
    setAssumptions(a => [...a, emptyDraft()]);
    setExpandedIdx(assumptions.length);
  };

  const removeAssumption = (i: number) => {
    setAssumptions(a => a.filter((_, idx) => idx !== i));
  };

  const updateAssumption = (i: number, field: keyof AssumptionDraft, value: string) => {
    setAssumptions(a => a.map((as, idx) => idx === i ? { ...as, [field]: value } : as));
  };

  // Stable preview hashes — only recomputed when assumption texts or parties change,
  // not on every wagmi poll re-render. Salts here are for preview only; handleSubmit
  // generates its own fresh salts at submission time.
  const { assumptionsRoot, agreementRoot } = useMemo(() => {
    const previewCommitments = assumptions.map(a => {
      if (!a.text) return null;
      const salt = generateSalt();
      return createAssumptionCommitment(a.text, salt);
    });
    const assumptionsRoot = previewCommitments.every(Boolean)
      ? createAssumptionsRoot(previewCommitments as string[])
      : '';
    const agreementRoot = assumptionsRoot && counterparty && address
      ? createAgreementRoot(summary, address, counterparty, assumptionsRoot)
      : '';
    return { assumptionsRoot, agreementRoot };
  }, [assumptions, counterparty, address, summary]);

  async function handleSubmit() {
    if (submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true);
    setError('');
    try {
      const agreementId = `agr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const saltsMap: { salt: string; commitment: string }[] = [];
      const vaultSaves: Promise<void>[] = [];
      for (let i = 0; i < assumptions.length; i++) {
        const a = assumptions[i];
        const salt = generateSalt();
        const commitment = createAssumptionCommitment(a.text, salt);
        const localAssumption: PrivateAssumption = {
          localId: `${agreementId}-${i}`,
          agreementId,
          title: a.title,
          category: a.category,
          normalisedText: normaliseAssumption(a.text),
          triggerCondition: a.triggerCondition,
          expectedState: a.expectedState,
          contradictionTest: a.materialityThreshold,
          materialityThreshold: a.materialityThreshold,
          preferredRemedy: a.preferredRemedy,
          salt,
          commitment,
        };
        // Fire vault save without blocking — IndexedDB can stall, don't let it
        // hold up navigation. The save completes in the background.
        vaultSaves.push(saveAssumption(localAssumption));
        saltsMap.push({ salt, commitment });
      }

      const root = createAssumptionsRoot(saltsMap.map(s => s.commitment));
      const agrRoot = createAgreementRoot(summary, address, counterparty, root);

      // TODO: call GenLayer contract create_agreement here
      const record = {
        id: agreementId,
        title,
        creator: address,
        counterparty,
        agreementSummary: summary,
        agreementRoot: agrRoot,
        assumptionsRoot: root,
        assumptionCount: assumptions.length,
        status: 'COMMITTED',
        createdAt: Date.now(),
        commitments: saltsMap.map(s => s.commitment),
      };
      // Wait for vault saves before navigating — reveal page reads from IndexedDB immediately
      await Promise.allSettled(vaultSaves).then(results => {
        results.forEach((r, i) => {
          if (r.status === 'rejected') console.warn(`Vault save ${i} failed:`, r.reason);
        });
      });

      await saveAgreement(record);
      console.log('[NewAgreement] saved to Firestore, id:', agreementId);

      // On-chain commit — awaited so MetaMask popup stays open for signing
      try {
        const txHash = await glCreateAgreement({
          counterparty,
          agreementSummary: summary,
          agreementRoot: agrRoot,
          assumptionsRoot: root,
          commitments: saltsMap.map(s => s.commitment),
        });
        if (txHash) console.info('[NewAgreement] GenLayer tx:', txHash);
        else console.warn('[NewAgreement] glCreateAgreement returned null — no wallet or contract not set');
      } catch (e) {
        console.warn('[NewAgreement] GenLayer create_agreement failed:', e);
      }

      router.push(`/app/agreements/${agreementId}`);
    } catch (e) {
      setError(String(e));
      submitGuard.current = false; // allow retry on error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto slide-up">
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
          New Agreement
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Create a private assumption-based agreement. Commitments are stored on GenLayer; full assumptions stay in your local vault.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {['Parties', 'Summary', 'Assumptions', 'Preview', 'Submit'].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              i === stepIdx ? 'bg-[var(--primary)] text-white' :
              i < stepIdx ? 'bg-[var(--primary-soft)] text-[var(--primary)]' :
              'bg-[var(--border)] text-[var(--muted)]'
            }`}>
              {i < stepIdx ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>}
              {label}
            </div>
            {i < 4 && <div className="w-4 h-px bg-[var(--border)]" />}
          </div>
        ))}
      </div>

      {/* Step: Parties */}
      {step === 'parties' && (
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">Agreement Parties</h2>
          <div>
            <label className="text-sm font-medium text-[var(--text)]">Your address (creator)</label>
            <div className="mt-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] font-mono text-xs text-[var(--muted)]">
              {address}
            </div>
          </div>
          <Input
            label="Counterparty wallet address"
            placeholder="0x..."
            value={counterparty}
            onChange={e => setCounterparty(e.target.value)}
            hint="The other party must have a wallet to activate the agreement."
          />
          <Input
            label="Agreement title (private label)"
            placeholder="Supply Agreement Q3 2026"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={() => setStep('summary')}
            disabled={!counterparty.startsWith('0x') || counterparty.length < 42 || !title}
          >
            Continue
          </Button>
        </Card>
      )}

      {/* Step: Summary */}
      {step === 'summary' && (
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">Agreement Summary</h2>
          <p className="text-xs text-[var(--muted)]">
            This summary will be stored publicly on GenLayer. Do not include sensitive details here.
          </p>
          <Textarea
            label="Public agreement summary"
            placeholder="Supplier will deliver industrial equipment by July 30, 2026 at the agreed specification and price."
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={5}
            hint="Keep this brief and non-sensitive. Private assumptions will be committed separately."
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('parties')}>Back</Button>
            <Button className="flex-1" onClick={() => setStep('assumptions')} disabled={summary.length < 20}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step: Assumptions */}
      {step === 'assumptions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Private Assumptions</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                These stay in your local vault. Only commitment hashes go on-chain.
              </p>
            </div>
            <Badge variant="muted">
              <Lock className="w-3 h-3" />
              Private by default
            </Badge>
          </div>

          {assumptions.map((a, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-[var(--primary-soft)] transition-colors"
                onClick={() => setExpandedIdx(expandedIdx === i ? -1 : i)}
              >
                <Lock className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span className="text-sm font-medium flex-1">
                  {a.title || `Assumption ${i + 1}`}
                </span>
                {a.text && <Badge variant="success"><CheckCircle className="w-3 h-3" /> Defined</Badge>}
                <span className="text-[var(--muted)] text-xs">{expandedIdx === i ? '▲' : '▼'}</span>
              </button>

              {expandedIdx === i && (
                <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
                  <div className="pt-3">
                    <Input
                      label="Assumption title"
                      placeholder="Port Access Condition"
                      value={a.title}
                      onChange={e => updateAssumption(i, 'title', e.target.value)}
                    />
                  </div>
                  <Select
                    label="Category"
                    options={CATEGORIES}
                    value={a.category}
                    onChange={e => updateAssumption(i, 'category', e.target.value as AssumptionCategory)}
                  />
                  <Textarea
                    label="Assumption text (will be hashed)"
                    placeholder="The Lagos port remains open for inbound equipment delivery through July 30."
                    value={a.text}
                    onChange={e => updateAssumption(i, 'text', e.target.value)}
                    rows={3}
                    hint="Write precisely. The exact text (normalised) will be used for the commitment hash."
                  />
                  <Input
                    label="Trigger condition"
                    placeholder="Port closure or suspension of inbound operations"
                    value={a.triggerCondition}
                    onChange={e => updateAssumption(i, 'triggerCondition', e.target.value)}
                  />
                  <Input
                    label="Expected state"
                    placeholder="Port operational for inbound delivery"
                    value={a.expectedState}
                    onChange={e => updateAssumption(i, 'expectedState', e.target.value)}
                  />
                  <Input
                    label="Materiality threshold"
                    placeholder="Any closure exceeding 3 business days"
                    value={a.materialityThreshold}
                    onChange={e => updateAssumption(i, 'materialityThreshold', e.target.value)}
                  />
                  <Select
                    label="Preferred remedy if violated"
                    options={REMEDIES}
                    value={a.preferredRemedy}
                    onChange={e => updateAssumption(i, 'preferredRemedy', e.target.value as ResolutionAction)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeAssumption(i)}
                    disabled={assumptions.length === 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                </div>
              )}
            </Card>
          ))}

          <Button variant="secondary" className="w-full" onClick={addAssumption}>
            <Plus className="w-3.5 h-3.5" />
            Add Assumption
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('summary')}>Back</Button>
            <Button
              className="flex-1"
              onClick={() => setStep('preview')}
              disabled={assumptions.some(a => !a.text || !a.title)}
            >
              Preview Commitments
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--muted)]" />
              <h2 className="text-sm font-semibold">Commitment Preview</h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Only hashes will be stored on GenLayer. Full assumption text stays in your local vault.
            </p>

            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)] font-mono">agreementRoot</div>
              <div className="hash-text bg-[var(--bg)] rounded px-2 py-1.5">{agreementRoot || '—'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--muted)] font-mono">assumptionsRoot</div>
              <div className="hash-text bg-[var(--bg)] rounded px-2 py-1.5">{assumptionsRoot || '—'}</div>
            </div>

            <div className="border-t border-[var(--border)] pt-3 space-y-2">
              <div className="text-xs font-medium text-[var(--text)]">Assumption Commitments</div>
              {assumptions.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--bg)]">
                  <Lock className="w-3.5 h-3.5 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--text)]">{a.title}</div>
                    <div className="hash-text mt-0.5">commitment: [generated on submit]</div>
                  </div>
                  <Badge variant="muted" className="text-[10px]">PRIVATE</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border-[var(--accent)] border">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">Backup your vault before submitting</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Assumption salts are generated locally and stored in your browser vault.
                  If you lose them, you cannot prove a commitment match. Export a backup from{' '}
                  <a href="/app/vault" className="underline">Local Vault</a>.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('assumptions')}>Back</Button>
            <Button className="flex-1" onClick={() => setStep('submit')}>
              <Hash className="w-3.5 h-3.5" />
              Proceed to Submit
            </Button>
          </div>
        </div>
      )}

      {/* Step: Submit */}
      {step === 'submit' && (
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">Submit to GenLayer</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Title</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Counterparty</span>
              <span className="font-mono text-xs">{counterparty.slice(0, 10)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Private assumptions</span>
              <span className="font-medium">{assumptions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Public on-chain</span>
              <span className="text-[var(--primary)] font-medium">Hashes only</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#f5dcd9] text-[var(--danger)] text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('preview')}>Back</Button>
            <Button className="flex-1" loading={submitting} onClick={handleSubmit}>
              <Lock className="w-3.5 h-3.5" />
              Sign & Commit Agreement
            </Button>
          </div>
          <p className="text-[10px] text-[var(--muted)] text-center">
            This will store commitment hashes on GenLayer Studionet. Private assumptions are saved locally.
          </p>
        </Card>
      )}
    </div>
  );
}
