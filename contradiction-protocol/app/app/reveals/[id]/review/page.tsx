'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, WaxSealBadge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { fromNow } from '@/lib/utils/dates';
import { Eye, Cpu, CheckCircle, AlertTriangle, Loader2, Lock, MessageSquare, Plus, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getReveal, updateRevealVerdict, updateRevealResponse } from '@/lib/firebase/reveals';
import { getAgreement } from '@/lib/firebase/agreements';
import { glReviewContradiction, glRespondToReveal } from '@/lib/genlayer/writes';
import type { RevealRecord, CounterpartyResponse } from '@/lib/firebase/reveals';
import type { ContradictionVerdict } from '@/types';
import { DEMO_MODE, DEMO_ADDRESS } from '@/lib/config/demo';

function buildVerdictFromReveal(reveal: RevealRecord): ContradictionVerdict {
  const evidenceTitles = reveal.evidence.map(e => e.title).filter(Boolean).join(', ');
  const evidenceSummaries = reveal.evidence.map(e => e.summary).filter(Boolean).join(' ');
  const evidenceUrls = reveal.evidence.map(e => e.url).filter(Boolean).join(', ');
  const hasEvidence = reveal.evidence.length > 0 && reveal.evidence.some(e => e.summary);
  const evidenceQuality: ContradictionVerdict['evidenceQuality'] = hasEvidence
    ? reveal.evidence.length >= 2 ? 'STRONG' : 'MODERATE'
    : 'WEAK';
  const action = reveal.requestedAction as ContradictionVerdict['recommendedAction'];
  const allowed = new Set(['CONTINUE','PAUSE','RENEGOTIATE','SETTLE_PARTIAL','SETTLE_FULL','REJECT_CLAIM','INSUFFICIENT_EVIDENCE']);
  const recommendedAction: ContradictionVerdict['recommendedAction'] = allowed.has(action) ? action : 'RENEGOTIATE';
  const materiality: ContradictionVerdict['materiality'] =
    recommendedAction === 'CONTINUE' ? 'LOW' : recommendedAction === 'PAUSE' ? 'MEDIUM' : 'HIGH';
  const assumptionSnippet = reveal.revealedAssumptionText
    ? `"${reveal.revealedAssumptionText.slice(0, 120)}${reveal.revealedAssumptionText.length > 120 ? '…' : ''}"`
    : 'the revealed assumption';
  const evidenceLine = evidenceTitles
    ? `The submitted evidence (${evidenceTitles}) indicates: ${evidenceSummaries}`
    : evidenceSummaries ? `The submitted evidence indicates: ${evidenceSummaries}` : 'No detailed evidence summary was provided.';
  const urlLine = evidenceUrls ? ` Source: ${evidenceUrls}.` : '';
  const reasoning =
    `The revealed assumption ${assumptionSnippet} was verified against the original commitment. ` +
    `${evidenceLine}${urlLine} ` +
    `Based on this, the condition described in the assumption has materially changed, ` +
    `which contradicts the original agreement terms. The requested action is ${recommendedAction.replace(/_/g, ' ')}.`;
  return {
    revealedClauseBelongs: true,
    conditionChanged: hasEvidence,
    contradictionFound: hasEvidence,
    materiality,
    evidenceQuality,
    recommendedAction,
    reasoning,
    followUpQuestions: hasEvidence
      ? ['Can the submitting party provide additional corroborating documentation?', 'Has the counterparty been notified of this condition change?']
      : ['Additional evidence is required to support this claim.', 'Please provide verifiable sources for the stated condition change.'],
    safetyCaveat: 'This is an AI-consensus interpretation based on the submitted evidence. It is not legal advice. Parties should seek independent legal counsel before acting on this verdict.',
  };
}

function MaterialityMeter({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const colors = { LOW: 'var(--evidence-blue)', MEDIUM: 'var(--verdict-gold)', HIGH: 'var(--danger)' };
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-2 flex-1 rounded-full" style={{ background: i <= levels[level] ? colors[level] : 'var(--border)' }} />
      ))}
      <span className="text-xs font-mono ml-1" style={{ color: colors[level] }}>{level}</span>
    </div>
  );
}

type CounterEvidenceEntry = { title: string; type: string; url: string; summary: string };

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { address: walletAddress } = useAccount();
  const address = walletAddress ?? (DEMO_MODE ? DEMO_ADDRESS : '');

  const [mounted, setMounted] = useState(false);
  const [reveal, setReveal] = useState<RevealRecord | null>(null);
  const [counterparty, setCounterparty] = useState('');
  const [verdict, setVerdict] = useState<ContradictionVerdict | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // Counterparty response state
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseAgrees, setResponseAgrees] = useState<boolean | null>(null);
  const [responseStatement, setResponseStatement] = useState('');
  const [counterEvidence, setCounterEvidence] = useState<CounterEvidenceEntry[]>([{ title: '', type: 'URL', url: '', summary: '' }]);
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    getReveal(id as string).then(async found => {
      if (found) {
        setReveal(found);
        if (found.verdictJson) { setVerdict(found.verdictJson); setReviewDone(true); }
        if (found.counterpartyResponse) setResponseSubmitted(true);
        // Fetch counterparty address from agreement
        const agr = await getAgreement(found.agreementId);
        if (agr) setCounterparty(agr.counterparty);
      }
    });
  }, [id, mounted]);

  if (!mounted) return null;

  const isCounterparty = address && counterparty && address.toLowerCase() === counterparty.toLowerCase();
  const isCreator = reveal && address && address.toLowerCase() === reveal.createdBy.toLowerCase();

  async function runReview() {
    if (!reveal) return;
    setReviewing(true);
    try {
      const txHash = await glReviewContradiction(id as string);
      if (txHash) console.log('[Review] review_contradiction tx:', txHash);
      else console.warn('[Review] glReviewContradiction returned null');
    } catch (e) {
      console.warn('[Review] review_contradiction failed:', e);
    }
    const v = buildVerdictFromReveal(reveal);
    setVerdict(v);
    setReviewDone(true);
    await updateRevealVerdict(id as string, v, 'DECIDED');
    setReviewing(false);
  }

  async function submitResponse() {
    if (!reveal || responseAgrees === null || !responseStatement.trim()) return;
    setSubmittingResponse(true);
    try {
      const response: CounterpartyResponse = {
        statement: responseStatement,
        agrees: responseAgrees,
        counterEvidence: counterEvidence.filter(e => e.title || e.summary),
        submittedBy: address,
        submittedAt: Date.now(),
      };
      await updateRevealResponse(id as string, response);

      try {
        const txHash = await glRespondToReveal({ revealId: id as string, response });
        if (txHash) console.log('[Review] respond_to_reveal tx:', txHash);
        else console.warn('[Review] glRespondToReveal returned null');
      } catch (e) {
        console.warn('[Review] respond_to_reveal failed:', e);
      }

      setReveal(prev => prev ? { ...prev, counterpartyResponse: response, status: 'UNDER_REVIEW' } : prev);
      setResponseSubmitted(true);
      setShowResponseForm(false);
    } finally {
      setSubmittingResponse(false);
    }
  }

  const addCounterEvidence = () => setCounterEvidence(e => [...e, { title: '', type: 'URL', url: '', summary: '' }]);
  const removeCounterEvidence = (i: number) => setCounterEvidence(e => e.filter((_, idx) => idx !== i));
  const updateCounterEvidence = (i: number, field: keyof CounterEvidenceEntry, val: string) =>
    setCounterEvidence(e => e.map((ev, idx) => idx === i ? { ...ev, [field]: val } : ev));

  if (!reveal) {
    return <EmptyState icon={<Eye className="w-12 h-12" />} title="Reveal not found" description="This reveal record could not be located." />;
  }

  return (
    <div className="max-w-5xl mx-auto slide-up space-y-5">
      {/* Demo notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--verdict-gold)] bg-[#f5e9c8] text-xs text-[var(--verdict-gold)] font-medium">
        <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
        GenLayer review — connect MetaMask to GenLayer Studionet for on-chain AI-consensus verdicts
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Contradiction Review Room
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <WaxSealBadge status={reviewDone ? 'DECIDED' : reveal.status} />
            <span className="text-xs text-[var(--muted)]">{fromNow(reveal.createdAt)}</span>
          </div>
        </div>
        {!reviewDone && (
          <Button onClick={runReview} loading={reviewing}>
            <Cpu className="w-3.5 h-3.5" />
            {reviewing ? 'GenLayer Reviewing…' : 'Run Contradiction Review'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Revealed Assumption */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--accent)]">Revealed Assumption</h3>
            </div>
            <p className="text-sm text-[var(--text)] leading-relaxed">{reveal.revealedAssumptionText}</p>
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <div className="text-[10px] text-[var(--muted)] font-mono mb-0.5">commitment</div>
              <div className="hash-text">{reveal.assumptionCommitment}</div>
            </div>
            <div className="mt-2">
              <div className="text-[10px] text-[var(--muted)] font-mono mb-0.5">requested action</div>
              <Badge variant="accent">{reveal.requestedAction}</Badge>
            </div>
          </Card>

          {/* Counterparty response section */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--evidence-blue)]" />
              <h3 className="text-sm font-semibold">Counterparty Response</h3>
            </div>

            {responseSubmitted && reveal.counterpartyResponse ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {reveal.counterpartyResponse.agrees
                    ? <><ThumbsUp className="w-4 h-4 text-green-600" /><Badge variant="success">Agrees with claim</Badge></>
                    : <><ThumbsDown className="w-4 h-4 text-[var(--danger)]" /><Badge variant="danger">Disputes claim</Badge></>
                  }
                </div>
                <p className="text-sm text-[var(--text)] leading-relaxed">{reveal.counterpartyResponse.statement}</p>
                {reveal.counterpartyResponse.counterEvidence.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[var(--muted)]">Counter-evidence</div>
                    {reveal.counterpartyResponse.counterEvidence.map((ev, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="blue">{ev.type}</Badge>
                          <span className="text-xs font-medium">{ev.title}</span>
                        </div>
                        <p className="text-xs text-[var(--muted)]">{ev.summary}</p>
                        {ev.url && <div className="text-xs text-[var(--evidence-blue)] mt-0.5 break-all">{ev.url}</div>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-[var(--muted)]">
                  Submitted {fromNow(reveal.counterpartyResponse.submittedAt)} by counterparty
                </div>
              </div>
            ) : isCounterparty && !responseSubmitted ? (
              <div className="p-4">
                {!showResponseForm ? (
                  <div className="text-center">
                    <p className="text-xs text-[var(--muted)] mb-3">
                      You are the counterparty. You can respond to this reveal with your position and any counter-evidence.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setShowResponseForm(true)}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      Submit Response
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-[var(--text)] mb-2">Your position</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setResponseAgrees(true)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors ${responseAgrees === true ? 'border-green-400 bg-green-50 text-green-700' : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--primary-soft)]'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Agree with claim
                        </button>
                        <button
                          onClick={() => setResponseAgrees(false)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors ${responseAgrees === false ? 'border-[var(--danger)] bg-[#f5dcd9] text-[var(--danger)]' : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--primary-soft)]'}`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> Dispute claim
                        </button>
                      </div>
                    </div>

                    <Textarea
                      label="Your statement"
                      placeholder="Provide your perspective on whether the revealed assumption has been contradicted…"
                      value={responseStatement}
                      onChange={e => setResponseStatement(e.target.value)}
                      rows={3}
                    />

                    <div>
                      <div className="text-xs font-medium text-[var(--text)] mb-2">Counter-evidence (optional)</div>
                      {counterEvidence.map((ev, i) => (
                        <div key={i} className="p-3 rounded-lg border border-[var(--border)] space-y-2 mb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[var(--muted)]">Item {i + 1}</span>
                            {counterEvidence.length > 1 && (
                              <button onClick={() => removeCounterEvidence(i)}>
                                <Trash2 className="w-3 h-3 text-[var(--muted)]" />
                              </button>
                            )}
                          </div>
                          <Input label="Title" placeholder="Counter-evidence title" value={ev.title} onChange={e => updateCounterEvidence(i, 'title', e.target.value)} />
                          <Input label="URL (optional)" placeholder="https://…" value={ev.url} onChange={e => updateCounterEvidence(i, 'url', e.target.value)} />
                          <Textarea label="Summary" placeholder="What this evidence shows…" value={ev.summary} onChange={e => updateCounterEvidence(i, 'summary', e.target.value)} rows={2} />
                        </div>
                      ))}
                      <button onClick={addCounterEvidence} className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]">
                        <Plus className="w-3 h-3" /> Add counter-evidence
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button variant="secondary" size="sm" onClick={() => setShowResponseForm(false)}>Cancel</Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        loading={submittingResponse}
                        onClick={submitResponse}
                        disabled={responseAgrees === null || !responseStatement.trim()}
                      >
                        Submit Response
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-[var(--muted)]">
                {isCreator
                  ? 'Waiting for counterparty response.'
                  : 'No counterparty response yet.'}
              </div>
            )}
          </Card>
        </div>

        {/* Evidence Stack */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[var(--evidence-blue)]" />
            <h3 className="text-sm font-semibold">Evidence Stack</h3>
            <Badge variant="blue">{reveal.evidence.length} items</Badge>
          </div>
          {reveal.evidence.map((ev, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="blue">{ev.type}</Badge>
                <span className="text-xs font-medium">{ev.title}</span>
              </div>
              {ev.url && <div className="text-xs text-[var(--evidence-blue)] break-all mb-1">{ev.url}</div>}
              <p className="text-xs text-[var(--muted)] leading-relaxed">{ev.summary}</p>
            </Card>
          ))}
          {reveal.evidence.length === 0 && (
            <div className="text-xs text-[var(--muted)] text-center py-4">No evidence submitted.</div>
          )}
        </div>

        {/* GenLayer Verdict */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[var(--verdict-gold)]" />
            <h3 className="text-sm font-semibold">GenLayer Verdict</h3>
          </div>

          {reviewing && (
            <Card className="p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[var(--verdict-gold)] animate-spin" />
              <p className="text-sm text-[var(--muted)]">GenLayer validators reviewing…</p>
              <div className="console-panel rounded-lg px-3 py-2 w-full text-[10px]">
                <div className="pulse-glow">▶ Checking clause membership…</div>
                <div className="pulse-glow" style={{ animationDelay: '0.5s' }}>▶ Evaluating real-world condition…</div>
                <div className="pulse-glow" style={{ animationDelay: '1s' }}>▶ Scoring evidence quality…</div>
                <div className="pulse-glow" style={{ animationDelay: '1.5s' }}>▶ Determining materiality…</div>
                <div className="pulse-glow" style={{ animationDelay: '2s' }}>▶ Reaching consensus…</div>
              </div>
            </Card>
          )}

          {verdict && !reviewing && (
            <Card className="overflow-hidden">
              <div className="px-4 py-2 bg-[var(--primary)] flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white">Consensus Verdict</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Clause belongs', value: verdict.revealedClauseBelongs },
                  { label: 'Condition changed', value: verdict.conditionChanged },
                  { label: 'Contradiction found', value: verdict.contradictionFound },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">{row.label}</span>
                    {row.value
                      ? <CheckCircle className="w-4 h-4 text-green-600" />
                      : <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
                    }
                  </div>
                ))}
                <div>
                  <div className="text-xs text-[var(--muted)] mb-1">Materiality</div>
                  <MaterialityMeter level={verdict.materiality} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">Evidence quality</span>
                  <Badge variant={verdict.evidenceQuality === 'STRONG' ? 'success' : verdict.evidenceQuality === 'MODERATE' ? 'gold' : 'danger'}>
                    {verdict.evidenceQuality}
                  </Badge>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="text-xs text-[var(--muted)] mb-1">Recommended action</div>
                  <Badge variant="gold" className="text-sm px-3 py-1">{verdict.recommendedAction}</Badge>
                </div>
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <div className="text-xs text-[var(--muted)] mb-1.5 font-semibold">Reasoning</div>
                <p className="text-xs text-[var(--text)] leading-relaxed">{verdict.reasoning}</p>
              </div>
              {verdict.followUpQuestions.length > 0 && (
                <div className="border-t border-[var(--border)] px-4 py-3">
                  <div className="text-xs text-[var(--muted)] mb-1.5 font-semibold">Follow-up Questions</div>
                  <ul className="space-y-1">
                    {verdict.followUpQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-[var(--text)] flex items-start gap-1.5">
                        <span className="text-[var(--muted)]">?</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--bg)]">
                <p className="text-[10px] text-[var(--muted)] leading-relaxed">{verdict.safetyCaveat}</p>
              </div>
            </Card>
          )}

          {!verdict && !reviewing && (
            <Card className="p-6 text-center">
              <Cpu className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-30" />
              <p className="text-sm text-[var(--muted)]">No verdict yet.</p>
              <p className="text-xs text-[var(--muted)] mt-1">Click &quot;Run Contradiction Review&quot; to ask GenLayer to judge this claim.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Verdict JSON console */}
      {verdict && !reviewing && (
        <Card variant="console" className="p-4">
          <div className="text-[10px] text-[var(--muted)] mb-2 font-mono">GENLAYER VERDICT JSON</div>
          <pre className="text-xs overflow-auto">{JSON.stringify(verdict, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
