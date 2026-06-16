'use client';
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createDemoAssumptions } from '@/lib/protocol/seedLocal';
import { createAssumptionsRoot, createAgreementRoot } from '@/lib/commitments/hash';
import { FlaskConical, Play, CheckCircle, Loader2, Cpu, Lock, Unlock, Eye } from 'lucide-react';
import type { ContradictionVerdict } from '@/types';

type TraceEntry = {
  tag: string;
  message: string;
  detail?: string;
  status: 'pending' | 'running' | 'done' | 'verdict';
};

const STEPS_META = [
  { num: '01', title: 'Agreement Commitment', desc: 'Hidden assumptions are created locally, hashed with salts, and roots committed to GenLayer.' },
  { num: '02', title: 'Assumption Hashing', desc: 'Each assumption is normalised and committed: keccak256(text + salt).' },
  { num: '03', title: 'Selective Reveal', desc: 'Only the affected assumption is disclosed. All others stay private.' },
  { num: '04', title: 'Evidence Packet', desc: 'URL references and text statements assembled into a structured evidence payload.' },
  { num: '05', title: 'GenLayer Intelligent Review', desc: 'AI-validator consensus runs the contradiction review prompt and returns a structured verdict.' },
  { num: '06', title: 'Verdict Output', desc: 'Structured JSON verdict: materiality, evidence quality, recommended action.' },
  { num: '07', title: 'Resolution Timeline', desc: 'Agreement status updates. Parties prompted to act on the verdict.' },
];

const DEMO_VERDICT: ContradictionVerdict = {
  revealedClauseBelongs: true,
  conditionChanged: true,
  contradictionFound: true,
  materiality: 'HIGH',
  evidenceQuality: 'STRONG',
  recommendedAction: 'RENEGOTIATE',
  reasoning:
    'The revealed assumption ("The Lagos port remains open for inbound equipment delivery through July 30") was verified against the original commitment. The submitted evidence (Port authority closure notice, logistics memo) confirms the port suspended inbound operations from July 15–31, directly overlapping the delivery window. This materially contradicts the original assumption and renders the agreed delivery terms infeasible. Renegotiation of the delivery schedule and associated terms is the appropriate response.',
  followUpQuestions: [
    'Can the supplier provide an alternative delivery route or revised schedule?',
    'Has the counterparty acknowledged the force majeure condition in writing?',
  ],
  safetyCaveat:
    'This is an AI-consensus interpretation based on submitted evidence. It is not legal advice. Parties should seek independent legal counsel before acting on this verdict.',
};

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

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

export default function PlaygroundPage() {
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [done, setDone] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [verdict, setVerdict] = useState<ContradictionVerdict | null>(null);
  const [demoRoots, setDemoRoots] = useState<{ agreementRoot: string; assumptionsRoot: string } | null>(null);
  const traceRef = useRef<HTMLDivElement>(null);

  function appendTrace(entry: TraceEntry) {
    setTrace(t => [...t, entry]);
    setTimeout(() => traceRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  }

  async function runScenario() {
    setRunning(true);
    setDone(false);
    setTrace([]);
    setVerdict(null);
    setDemoRoots(null);
    setActiveStep(0);

    const agreementId = `demo-${Date.now()}`;
    const assumptions = createDemoAssumptions(agreementId);
    const commitments = assumptions.map(a => a.commitment);
    const assumptionsRoot = createAssumptionsRoot(commitments);
    const creator = '0xCreator000000000000000000000000000000001';
    const counterparty = '0xCounterparty00000000000000000000000000002';
    const summary = 'Supplier will deliver industrial equipment by July 30, 2026.';
    const agreementRoot = createAgreementRoot(summary, creator, counterparty, assumptionsRoot);

    setDemoRoots({ agreementRoot, assumptionsRoot });

    // Step 01 — Agreement drafted
    appendTrace({ tag: 'AGREEMENT_DRAFTED', message: 'Hidden assumptions created locally', detail: `${assumptions.length} assumptions with salts — not sent to any server`, status: 'done' });
    await sleep(600);
    setActiveStep(1);

    // Step 02 — Assumption hashing
    for (const a of assumptions) {
      appendTrace({ tag: 'ASSUMPTION_HASHED', message: a.title, detail: `commitment: ${a.commitment.slice(0, 36)}…`, status: 'done' });
      await sleep(350);
    }
    setActiveStep(2);

    appendTrace({ tag: 'COMMITMENT_ROOT', message: 'Assumptions root committed on GenLayer', detail: `assumptionsRoot: ${assumptionsRoot.slice(0, 36)}…`, status: 'done' });
    appendTrace({ tag: 'AGREEMENT_ROOT', message: 'Agreement root stored on-chain', detail: `agreementRoot: ${agreementRoot.slice(0, 36)}…`, status: 'done' });
    await sleep(700);
    setActiveStep(3);

    // Step 03 — Selective reveal
    const revealedAssumption = assumptions[0];
    appendTrace({ tag: 'REALITY_CHANGED', message: 'Port closure confirmed — delivery window affected', detail: 'Lagos port suspended inbound operations July 15–31, 2026', status: 'done' });
    await sleep(500);

    appendTrace({ tag: 'SELECTIVE_REVEAL', message: `Revealing: "${revealedAssumption.title}"`, detail: revealedAssumption.normalisedText, status: 'done' });
    await sleep(500);
    setActiveStep(4);

    // Step 04 — Evidence
    appendTrace({ tag: 'HASH_CHECK', message: 'Commitment verified locally before submission', detail: `hash(revealed + salt) == ${revealedAssumption.commitment.slice(0, 24)}… ✓`, status: 'done' });
    await sleep(400);

    appendTrace({ tag: 'EVIDENCE_PACKET', message: 'Evidence packet assembled', detail: '2 items: URL (port authority closure notice) + TEXT_STATEMENT (logistics memo)', status: 'done' });
    await sleep(500);
    setActiveStep(5);

    // Step 05 — GenLayer review
    appendTrace({ tag: 'GENLAYER', message: 'Contradiction review submitted to GenLayer validators', detail: 'AI-consensus running…', status: 'running' });
    await sleep(2200);

    appendTrace({ tag: 'VALIDATOR_1', message: 'Validator A: RENEGOTIATE / HIGH / STRONG', detail: 'revealedClauseBelongs: true, conditionChanged: true, contradictionFound: true', status: 'done' });
    await sleep(400);
    appendTrace({ tag: 'VALIDATOR_2', message: 'Validator B: RENEGOTIATE / HIGH / STRONG', detail: 'Equivalence principle satisfied — consensus reached', status: 'done' });
    await sleep(500);
    setActiveStep(6);

    // Step 06 — Verdict
    appendTrace({ tag: 'CONSENSUS', message: 'RENEGOTIATE / HIGH MATERIALITY / STRONG EVIDENCE', detail: 'recommendedAction: RENEGOTIATE | materiality: HIGH | evidenceQuality: STRONG', status: 'verdict' });
    await sleep(600);

    // Step 07 — Resolution
    appendTrace({ tag: 'RESOLUTION', message: 'Agreement status → RENEGOTIATION_REQUESTED', detail: 'Parties prompted to amend delivery terms', status: 'done' });

    setVerdict(DEMO_VERDICT);
    setDone(true);
    setActiveStep(7);
    setRunning(false);
  }

  const tagColors: Record<string, string> = {
    AGREEMENT_DRAFTED: 'var(--primary)',
    ASSUMPTION_HASHED: 'var(--muted)',
    COMMITMENT_ROOT: 'var(--primary)',
    AGREEMENT_ROOT: 'var(--primary)',
    REALITY_CHANGED: 'var(--accent)',
    SELECTIVE_REVEAL: 'var(--accent)',
    HASH_CHECK: '#1f5e3a',
    EVIDENCE_PACKET: 'var(--evidence-blue)',
    GENLAYER: 'var(--verdict-gold)',
    VALIDATOR_1: 'var(--verdict-gold)',
    VALIDATOR_2: 'var(--verdict-gold)',
    CONSENSUS: 'var(--verdict-gold)',
    RESOLUTION: 'var(--primary)',
  };

  return (
    <div className="max-w-5xl mx-auto slide-up space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Consensus Playground
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Run a full contradiction scenario — commitment → reveal → GenLayer review — and watch the trace in real time.
          </p>
        </div>
        <Button onClick={runScenario} loading={running} disabled={running}>
          <Play className="w-3.5 h-3.5" />
          {running ? 'Running Scenario…' : 'Run Contradiction Scenario'}
        </Button>
      </div>

      {/* Step pills */}
      <div className="grid grid-cols-7 gap-2">
        {STEPS_META.map((s, i) => (
          <Card
            key={s.num}
            className={`p-3 transition-all ${
              activeStep === i ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' :
              activeStep > i ? 'border-[var(--primary-soft)]' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-mono text-[var(--muted)]">{s.num}</span>
              {activeStep > i && <CheckCircle className="w-3 h-3 text-green-600" />}
              {activeStep === i && running && <Loader2 className="w-3 h-3 text-[var(--accent)] animate-spin" />}
            </div>
            <div className="text-[11px] font-semibold text-[var(--text)] leading-snug">{s.title}</div>
          </Card>
        ))}
      </div>

      {/* Trace console */}
      <Card variant="console" className="overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[rgba(233,224,206,0.1)] flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">Contradiction Scenario Trace</span>
          {running && <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin text-[var(--verdict-gold)]" />}
          {done && <Badge variant="success" className="ml-auto">Complete</Badge>}
        </div>
        <div ref={traceRef} className="p-4 min-h-48 max-h-80 overflow-auto space-y-1.5">
          {trace.length === 0 && !running && (
            <div className="text-center py-10 text-[var(--muted)] opacity-40 text-sm">
              Click &quot;Run Contradiction Scenario&quot; to begin
            </div>
          )}
          {trace.map((entry, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="flex-shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: (tagColors[entry.tag] || 'var(--muted)') + '22', color: tagColors[entry.tag] || 'var(--muted)' }}
              >
                [{entry.tag}]
              </span>
              <div className="flex-1 min-w-0">
                <span className={`text-xs ${entry.status === 'verdict' ? 'font-bold text-[var(--verdict-gold)]' : 'text-[var(--console-text)]'}`}>
                  {entry.message}
                </span>
                {entry.detail && (
                  <div className="text-[10px] text-[var(--muted)] mt-0.5 font-mono break-all">{entry.detail}</div>
                )}
              </div>
              {entry.status === 'running' && (
                <Loader2 className="w-3 h-3 animate-spin text-[var(--verdict-gold)] flex-shrink-0 mt-0.5" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Post-run: Verdict + Roots side by side */}
      {done && verdict && demoRoots && (
        <div className="grid grid-cols-2 gap-4">
          {/* Structured verdict */}
          <Card className="overflow-hidden">
            <div className="px-4 py-2 bg-[var(--primary)] flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">GenLayer Consensus Verdict</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Clause belongs', value: verdict.revealedClauseBelongs ? 'YES' : 'NO', ok: verdict.revealedClauseBelongs },
                { label: 'Condition changed', value: verdict.conditionChanged ? 'YES' : 'NO', ok: verdict.conditionChanged },
                { label: 'Contradiction found', value: verdict.contradictionFound ? 'YES' : 'NO', ok: verdict.contradictionFound },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">{row.label}</span>
                  <Badge variant={row.ok ? 'success' : 'danger'}>{row.value}</Badge>
                </div>
              ))}

              <div>
                <div className="text-xs text-[var(--muted)] mb-1.5">Materiality</div>
                <MaterialityMeter level={verdict.materiality} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Evidence quality</span>
                <Badge variant="success">{verdict.evidenceQuality}</Badge>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <div className="text-xs text-[var(--muted)] mb-1">Recommended action</div>
                <Badge variant="gold" className="text-sm px-3 py-1">{verdict.recommendedAction}</Badge>
              </div>

              <div className="border-t border-[var(--border)] pt-3">
                <div className="text-xs text-[var(--muted)] mb-1 font-semibold">Reasoning</div>
                <p className="text-xs text-[var(--text)] leading-relaxed">{verdict.reasoning}</p>
              </div>
            </div>
            <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--bg)]">
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">{verdict.safetyCaveat}</p>
            </div>
          </Card>

          {/* Commitment roots + privacy summary */}
          <div className="space-y-3">
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-3.5 h-3.5 text-[var(--primary)]" />
                <h3 className="text-sm font-semibold">Commitment Roots</h3>
                <Badge variant="muted">Public on GenLayer</Badge>
              </div>
              {[
                { label: 'agreementRoot', value: demoRoots.agreementRoot },
                { label: 'assumptionsRoot', value: demoRoots.assumptionsRoot },
              ].map(r => (
                <div key={r.label}>
                  <div className="text-[10px] text-[var(--muted)] font-mono mb-0.5">{r.label}</div>
                  <div className="hash-text bg-[var(--bg)] rounded px-2 py-1.5 text-[10px]">{r.value}</div>
                </div>
              ))}
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <h3 className="text-sm font-semibold">Selective Disclosure</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] font-semibold text-[var(--accent)] mb-1.5">REVEALED</div>
                  <ul className="space-y-1">
                    {['Port Access Condition', 'Salt (proves membership)', 'Evidence packet', 'Requested action'].map(item => (
                      <li key={item} className="text-[10px] text-[var(--text)] flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5 text-[var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[var(--primary)] mb-1.5">STILL PRIVATE</div>
                  <ul className="space-y-1">
                    {['Price Band Assumption', 'Certification Condition', 'Other assumption salts', 'Private notes'].map(item => (
                      <li key={item} className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <Card variant="console" className="p-4">
              <div className="text-[10px] text-[var(--muted)] mb-2 font-mono">VERDICT JSON</div>
              <pre className="text-[10px] overflow-auto max-h-40">{JSON.stringify({
                revealedClauseBelongs: verdict.revealedClauseBelongs,
                conditionChanged: verdict.conditionChanged,
                contradictionFound: verdict.contradictionFound,
                materiality: verdict.materiality,
                evidenceQuality: verdict.evidenceQuality,
                recommendedAction: verdict.recommendedAction,
              }, null, 2)}</pre>
            </Card>
          </div>
        </div>
      )}

      {/* Steps description grid */}
      <div className="grid grid-cols-4 gap-3">
        {STEPS_META.map((s, i) => (
          <Card key={s.num} className={`p-4 transition-opacity ${activeStep >= i ? 'opacity-100' : 'opacity-40'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[var(--muted)]">{s.num}</span>
              {activeStep > i && <CheckCircle className="w-3 h-3 text-green-600" />}
              <h3 className="text-xs font-semibold">{s.title}</h3>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </div>

      {/* What GenLayer judges panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-[var(--verdict-gold)]" />
          <h3 className="text-sm font-semibold">What GenLayer Judges</h3>
          <Badge variant="gold">Not document storage</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { q: 'Clause membership', a: 'Did the revealed assumption match an original commitment?' },
            { q: 'Reality change', a: 'Does the evidence show the external condition changed?' },
            { q: 'Contradiction', a: 'Does the changed condition contradict the original assumption?' },
            { q: 'Remedy', a: 'Continue, pause, renegotiate, settle, reject, or insufficient evidence?' },
          ].map(item => (
            <div key={item.q} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text)] mb-1">{item.q}</div>
              <div className="text-[11px] text-[var(--muted)]">{item.a}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)] mt-4 pt-4 border-t border-[var(--border)]">
          GenLayer does not simply store agreements. It interprets contradiction claims based on revealed assumptions and evidence —
          using AI-validator consensus and the Equivalence Principle to reach a structured, actionable verdict.
        </p>
      </Card>
    </div>
  );
}
