'use client';
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createDemoAssumptions } from '@/lib/protocol/seedLocal';
import { createAssumptionsRoot, createAgreementRoot } from '@/lib/commitments/hash';
import { FlaskConical, Play, CheckCircle, Loader2 } from 'lucide-react';

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

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export default function PlaygroundPage() {
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [done, setDone] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const traceRef = useRef<HTMLDivElement>(null);

  function appendTrace(entry: TraceEntry) {
    setTrace(t => [...t, entry]);
    setTimeout(() => traceRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  }

  async function runScenario() {
    setRunning(true);
    setDone(false);
    setTrace([]);
    setActiveStep(0);

    const agreementId = `demo-${Date.now()}`;
    const assumptions = createDemoAssumptions(agreementId);
    const commitments = assumptions.map(a => a.commitment);
    const assumptionsRoot = createAssumptionsRoot(commitments);
    const creator = '0xCreator000000000000000000000000000000001';
    const counterparty = '0xCounterparty00000000000000000000000000002';
    const summary = 'Supplier will deliver industrial equipment by July 30, 2026.';
    const agreementRoot = createAgreementRoot(summary, creator, counterparty, assumptionsRoot);

    appendTrace({ tag: 'AGREEMENT_DRAFTED', message: 'Hidden assumptions created locally', detail: `${assumptions.length} assumptions with salts`, status: 'done' });
    await sleep(600);
    setActiveStep(1);

    for (const a of assumptions) {
      appendTrace({ tag: 'ASSUMPTION_HASHED', message: a.title, detail: a.commitment.slice(0, 32) + '…', status: 'done' });
      await sleep(400);
    }
    setActiveStep(2);

    appendTrace({ tag: 'COMMITMENT_ROOT', message: 'Assumptions root committed on GenLayer', detail: assumptionsRoot.slice(0, 32) + '…', status: 'done' });
    appendTrace({ tag: 'AGREEMENT_ROOT', message: 'Agreement root stored', detail: agreementRoot.slice(0, 32) + '…', status: 'done' });
    await sleep(700);
    setActiveStep(3);

    const revealedAssumption = assumptions[0];
    appendTrace({ tag: 'REALITY_CHANGED', message: 'Port closure confirmed — delivery window affected', detail: 'Lagos port suspended inbound operations July 15-31', status: 'done' });
    await sleep(500);
    setActiveStep(3);

    appendTrace({ tag: 'SELECTIVE_REVEAL', message: `Revealing: ${revealedAssumption.title}`, detail: revealedAssumption.normalisedText.slice(0, 80) + '…', status: 'done' });
    await sleep(500);
    setActiveStep(4);

    appendTrace({ tag: 'HASH_CHECK', message: 'Commitment verified', detail: `hash(revealed + salt) == ${revealedAssumption.commitment.slice(0, 20)}…`, status: 'done' });
    await sleep(400);

    appendTrace({ tag: 'EVIDENCE_PACKET', message: 'Evidence packet assembled', detail: '2 items: URL (port authority notice) + TEXT (logistics memo)', status: 'done' });
    await sleep(400);
    setActiveStep(5);

    appendTrace({ tag: 'GENLAYER', message: 'Contradiction review submitted to GenLayer validators', detail: 'Awaiting AI-consensus…', status: 'running' });
    await sleep(2000);

    appendTrace({ tag: 'VALIDATOR_1', message: 'Validator consensus: RENEGOTIATE / HIGH / STRONG', detail: 'revealedClauseBelongs: true, conditionChanged: true, contradictionFound: true', status: 'done' });
    await sleep(600);
    setActiveStep(6);

    appendTrace({ tag: 'CONSENSUS', message: 'RENEGOTIATE / HIGH MATERIALITY / STRONG EVIDENCE', detail: 'recommendedAction: RENEGOTIATE', status: 'verdict' });
    await sleep(500);

    appendTrace({ tag: 'RESOLUTION', message: 'Parties prompted to amend terms', detail: 'Agreement status → RENEGOTIATION_REQUESTED', status: 'done' });

    setDone(true);
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
    CONSENSUS: 'var(--verdict-gold)',
    RESOLUTION: 'var(--primary)',
  };

  return (
    <div className="max-w-5xl mx-auto slide-up space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Consensus Playground
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Run a full contradiction scenario and watch the commitment → reveal → review trace in real time.
          </p>
        </div>
        <Button onClick={runScenario} loading={running} disabled={running}>
          <Play className="w-3.5 h-3.5" />
          {running ? 'Running Scenario…' : 'Run Contradiction Scenario'}
        </Button>
      </div>

      {/* Steps overview */}
      <div className="grid grid-cols-7 gap-2">
        {STEPS_META.map((s, i) => (
          <Card
            key={s.num}
            className={`p-3 transition-all ${activeStep === i ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : activeStep > i ? 'border-[var(--primary-soft)]' : ''}`}
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

      <div className="grid grid-cols-2 gap-4">
        {/* Trace console */}
        <div className="col-span-2">
          <Card variant="console" className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[rgba(233,224,206,0.1)] flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Contradiction Scenario Trace</span>
              {running && <Loader2 className="w-3.5 h-3.5 ml-auto animate-spin text-[var(--verdict-gold)]" />}
              {done && <Badge variant="success" className="ml-auto">Complete</Badge>}
            </div>
            <div ref={traceRef} className="p-4 min-h-64 max-h-96 overflow-auto space-y-1.5">
              {trace.length === 0 && !running && (
                <div className="text-center py-12 text-[var(--muted)] opacity-40 text-sm">
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
                  <div>
                    <span className={`text-xs ${entry.status === 'verdict' ? 'font-bold text-[var(--verdict-gold)]' : 'text-[var(--console-text)]'}`}>
                      {entry.message}
                    </span>
                    {entry.detail && (
                      <div className="text-[10px] text-[var(--muted)] mt-0.5 font-mono">{entry.detail}</div>
                    )}
                  </div>
                  {entry.status === 'running' && (
                    <Loader2 className="w-3 h-3 animate-spin text-[var(--verdict-gold)] ml-auto mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Steps detail */}
      <div className="grid grid-cols-3 gap-3">
        {STEPS_META.map((s, i) => (
          <Card key={s.num} className={`p-4 ${activeStep >= i ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[var(--muted)]">{s.num}</span>
              <h3 className="text-sm font-semibold">{s.title}</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
