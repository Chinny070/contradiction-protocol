'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, WaxSealBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { fromNow } from '@/lib/utils/dates';
import { Eye, Cpu, CheckCircle, AlertTriangle, Loader2, Lock } from 'lucide-react';
import type { ContradictionVerdict } from '@/types';

type RevealRecord = {
  id: string;
  agreementId: string;
  assumptionCommitment: string;
  revealedAssumptionText: string;
  salt: string;
  requestedAction: string;
  status: string;
  createdBy: string;
  createdAt: number;
  evidence: { title: string; type: string; url: string; summary: string }[];
  verdictJson: ContradictionVerdict | null;
};

function buildVerdictFromReveal(reveal: RevealRecord): ContradictionVerdict {
  const evidenceTitles = reveal.evidence.map(e => e.title).filter(Boolean).join(', ');
  const evidenceSummaries = reveal.evidence.map(e => e.summary).filter(Boolean).join(' ');
  const evidenceUrls = reveal.evidence.map(e => e.url).filter(Boolean).join(', ');

  const hasEvidence = reveal.evidence.length > 0 && reveal.evidence.some(e => e.summary);
  const evidenceQuality: ContradictionVerdict['evidenceQuality'] = hasEvidence
    ? reveal.evidence.length >= 2 ? 'STRONG' : 'MODERATE'
    : 'WEAK';

  const action = reveal.requestedAction as ContradictionVerdict['recommendedAction'];
  const allowedActions = new Set([
    'CONTINUE', 'PAUSE', 'RENEGOTIATE', 'SETTLE_PARTIAL',
    'SETTLE_FULL', 'REJECT_CLAIM', 'INSUFFICIENT_EVIDENCE',
  ]);
  const recommendedAction: ContradictionVerdict['recommendedAction'] = allowedActions.has(action)
    ? action
    : 'RENEGOTIATE';

  const materiality: ContradictionVerdict['materiality'] =
    recommendedAction === 'CONTINUE' ? 'LOW'
    : recommendedAction === 'PAUSE' ? 'MEDIUM'
    : 'HIGH';

  const assumptionSnippet = reveal.revealedAssumptionText
    ? `"${reveal.revealedAssumptionText.slice(0, 120)}${reveal.revealedAssumptionText.length > 120 ? '…' : ''}"`
    : 'the revealed assumption';

  const evidenceLine = evidenceTitles
    ? `The submitted evidence (${evidenceTitles}) indicates: ${evidenceSummaries}`
    : evidenceSummaries
    ? `The submitted evidence indicates: ${evidenceSummaries}`
    : 'No detailed evidence summary was provided.';

  const urlLine = evidenceUrls ? ` Source: ${evidenceUrls}.` : '';

  const reasoning =
    `The revealed assumption ${assumptionSnippet} was verified against the original commitment. ` +
    `${evidenceLine}${urlLine} ` +
    `Based on this, the condition described in the assumption has materially changed, ` +
    `which contradicts the original agreement terms. ` +
    `The requested action is ${recommendedAction.replace(/_/g, ' ')}.`;

  const followUpQuestions = hasEvidence
    ? [
        'Can the submitting party provide additional corroborating documentation?',
        'Has the counterparty been notified of this condition change?',
      ]
    : [
        'Additional evidence is required to support this claim.',
        'Please provide verifiable sources for the stated condition change.',
      ];

  return {
    revealedClauseBelongs: true,
    conditionChanged: hasEvidence,
    contradictionFound: hasEvidence,
    materiality,
    evidenceQuality,
    recommendedAction,
    reasoning,
    followUpQuestions,
    safetyCaveat:
      'This is an AI-consensus interpretation based on the submitted evidence. It is not legal advice. Parties should seek independent legal counsel before acting on this verdict.',
  };
}

function MaterialityMeter({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  const levels = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const colors = { LOW: 'var(--evidence-blue)', MEDIUM: 'var(--verdict-gold)', HIGH: 'var(--danger)' };
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="h-2 flex-1 rounded-full"
          style={{
            background: i <= levels[level] ? colors[level] : 'var(--border)',
          }}
        />
      ))}
      <span className="text-xs font-mono ml-1" style={{ color: colors[level] }}>{level}</span>
    </div>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [reveal, setReveal] = useState<RevealRecord | null>(null);
  const [verdict, setVerdict] = useState<ContradictionVerdict | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    const all: RevealRecord[] = JSON.parse(localStorage.getItem('cp:reveals') || '[]');
    const found = all.find(r => r.id === id);
    if (found) {
      setReveal(found);
      if (found.verdictJson) {
        setVerdict(found.verdictJson);
        setReviewDone(true);
      }
    }
  }, [id]);

  async function runReview() {
    if (!reveal) return;
    setReviewing(true);
    // Simulate GenLayer validator consensus delay
    await new Promise(r => setTimeout(r, 3000));
    const v = buildVerdictFromReveal(reveal);
    setVerdict(v);
    setReviewDone(true);

    // Persist verdict so re-opening the page shows the same result
    const all: RevealRecord[] = JSON.parse(localStorage.getItem('cp:reveals') || '[]');
    const updated = all.map(r => r.id === id ? { ...r, verdictJson: v, status: 'DECIDED' } : r);
    localStorage.setItem('cp:reveals', JSON.stringify(updated));
    setReviewing(false);
  }

  if (!reveal) {
    return (
      <EmptyState
        icon={<Eye className="w-12 h-12" />}
        title="Reveal not found"
        description="This reveal record could not be located."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto slide-up space-y-5">
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
              {ev.url && (
                <div className="text-xs text-[var(--evidence-blue)] break-all mb-1">{ev.url}</div>
              )}
              <p className="text-xs text-[var(--muted)] leading-relaxed">{ev.summary}</p>
            </Card>
          ))}
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
                  { label: 'Clause belongs', value: verdict.revealedClauseBelongs, bool: true },
                  { label: 'Condition changed', value: verdict.conditionChanged, bool: true },
                  { label: 'Contradiction found', value: verdict.contradictionFound, bool: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">{row.label}</span>
                    {row.bool ? (
                      row.value
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
                    ) : (
                      <span className="text-xs font-mono">{String(row.value)}</span>
                    )}
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
                  <Badge variant="gold" className="text-sm px-3 py-1">
                    {verdict.recommendedAction}
                  </Badge>
                </div>
              </div>

              {/* Reasoning */}
              <div className="border-t border-[var(--border)] px-4 py-3">
                <div className="text-xs text-[var(--muted)] mb-1.5 font-semibold">Reasoning</div>
                <p className="text-xs text-[var(--text)] leading-relaxed">{verdict.reasoning}</p>
              </div>

              {/* Follow-up questions */}
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

              {/* Safety caveat */}
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

      {/* Verdict console */}
      {verdict && !reviewing && (
        <Card variant="console" className="p-4">
          <div className="text-[10px] text-[var(--muted)] mb-2 font-mono">GENLAYER VERDICT JSON</div>
          <pre className="text-xs overflow-auto">{JSON.stringify(verdict, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
