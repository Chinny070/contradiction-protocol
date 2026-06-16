import Link from 'next/link';
import { Lock, ArrowRight, Eye, Hash, Cpu, Shield, X, Check, Unlock, Scale } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] sticky top-0 z-10 backdrop-blur-sm" style={{ background: 'rgba(238,232,220,0.92)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Contradiction Protocol
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app/playground" className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Consensus Flow
          </Link>
          <Link href="/app/vault" className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Local Vault
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[#1a2e29] transition-colors"
          >
            Enter Protocol <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] text-xs text-[var(--muted)] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block animate-pulse" />
          GenLayer-native · Selective Disclosure · AI-Validator Consensus
        </div>

        <h1
          className="text-5xl font-bold text-[var(--text)] max-w-3xl leading-tight mb-6"
          style={{ fontFamily: 'var(--font-space), sans-serif' }}
        >
          Private agreements.<br />
          <span style={{ color: 'var(--accent)' }}>Selective reveals.</span><br />
          AI-consensus interpretation.
        </h1>

        <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed mb-10">
          Agreements break not only when payments are missed — they break when reality changes
          underneath hidden assumptions. Contradiction Protocol lets parties commit to those assumptions
          privately, reveal only the affected clause, and use GenLayer consensus to decide what happens next.
        </p>

        <div className="flex items-center gap-3 mb-20">
          <Link
            href="/app"
            className="flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[#1a2e29] transition-colors text-sm"
          >
            Enter Protocol <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/app/playground"
            className="flex items-center gap-2 px-7 py-3.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] font-medium hover:bg-[var(--primary-soft)] transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            View Consensus Flow
          </Link>
        </div>

        {/* Sample verdict card */}
        <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--panel)]">
            <Cpu className="w-3.5 h-3.5 text-[var(--verdict-gold)]" />
            <span className="text-xs font-mono text-[var(--muted)]">GenLayer Consensus Verdict — example output</span>
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f5e9c8] text-[var(--verdict-gold)] border border-[var(--verdict-gold)]">
              ⊛ DECIDED
            </span>
          </div>
          <div className="p-5 console-panel rounded-b-xl">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-4 text-xs">
              <span className="text-[var(--muted)]">revealedClauseBelongs</span>
              <span className="text-green-400 font-mono">true</span>
              <span className="text-[var(--muted)]">conditionChanged</span>
              <span className="text-green-400 font-mono">true</span>
              <span className="text-[var(--muted)]">contradictionFound</span>
              <span className="text-green-400 font-mono">true</span>
              <span className="text-[var(--muted)]">materiality</span>
              <span className="font-mono" style={{ color: 'var(--verdict-gold)' }}>HIGH</span>
              <span className="text-[var(--muted)]">evidenceQuality</span>
              <span className="text-blue-400 font-mono">STRONG</span>
              <span className="text-[var(--muted)]">recommendedAction</span>
              <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>RENEGOTIATE</span>
            </div>
            <p className="text-[var(--muted)] text-[11px] leading-relaxed border-t border-[rgba(233,224,206,0.1)] pt-3">
              &ldquo;The revealed assumption depended on the port remaining open. The submitted evidence confirms
              the port was closed during the performance window, materially contradicting the original assumption.
              Renegotiation of delivery terms is the appropriate response.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* How it works — 3-step */}
      <section className="px-8 py-20 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
              How the Protocol Works
            </h2>
            <p className="text-sm text-[var(--muted)]">Three steps. Private by default. GenLayer judges the contradiction.</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                icon: Hash,
                step: '01',
                color: 'var(--primary)',
                title: 'Commit Assumptions',
                desc: 'Each private assumption is normalised, salted, and hashed. Only the commitment goes on-chain. The full text stays in your local browser vault.',
                tag: 'keccak256(text + salt)',
              },
              {
                icon: Unlock,
                step: '02',
                color: 'var(--accent)',
                title: 'Selective Reveal',
                desc: 'When reality changes, you reveal only the affected assumption — proving it belongs to the original agreement using the salt and commitment hash.',
                tag: 'hash(reveal + salt) == commitment',
              },
              {
                icon: Cpu,
                step: '03',
                color: 'var(--verdict-gold)',
                title: 'GenLayer Judges',
                desc: 'AI-validator consensus evaluates whether the revealed assumption was contradicted, how material the change is, and what action should follow.',
                tag: 'CONTINUE / PAUSE / RENEGOTIATE / SETTLE',
              },
            ].map(item => (
              <div key={item.step} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: item.color + '18' }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <span className="text-xs font-mono text-[var(--muted)]">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold text-[var(--text)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">{item.desc}</p>
                <div className="px-2.5 py-1.5 rounded-md bg-[var(--bg)] border border-[var(--border)] font-mono text-[10px] text-[var(--muted)]">
                  {item.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What GenLayer judges */}
      <section className="px-8 py-20 border-t border-[var(--border)]" style={{ background: 'var(--panel)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--verdict-gold)] bg-[#f5e9c8] text-xs text-[var(--verdict-gold)] font-medium mb-6">
                <Cpu className="w-3 h-3" /> GenLayer Intelligent Contract
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
                What GenLayer Judges
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                GenLayer does not simply store agreements. It interprets contradiction claims based on
                revealed assumptions and evidence — using AI-validator consensus and the Equivalence
                Principle to reach a structured, actionable verdict.
              </p>
              <div className="space-y-3">
                {[
                  { q: 'Clause membership', a: 'Did the revealed assumption match an original commitment?' },
                  { q: 'Reality change', a: 'Does the evidence show the external condition changed?' },
                  { q: 'Contradiction', a: 'Does the changed condition contradict the original assumption?' },
                  { q: 'Materiality', a: 'Is the contradiction material enough to change obligations?' },
                  { q: 'Remedy', a: 'Continue, pause, renegotiate, or settle?' },
                ].map(item => (
                  <div key={item.q} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--verdict-gold)] mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-[var(--text)]">{item.q} </span>
                      <span className="text-xs text-[var(--muted)]">— {item.a}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assumption commitment visual */}
            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="text-[10px] font-mono text-[var(--muted)] mb-3">PRIVATE — local vault only</div>
                <div className="space-y-2">
                  {[
                    'The Lagos port remains open for inbound delivery through July 30.',
                    'Import tariff rate does not exceed 12% on equipment category A.',
                    'Client site access remains unrestricted through Q3 2026.',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--border)]">
                      <Lock className="w-3 h-3 text-[var(--muted)] mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-[var(--muted)] leading-relaxed">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)] py-1">
                <Hash className="w-3.5 h-3.5" />
                <span>Only commitment hashes go on-chain</span>
                <ArrowRight className="w-3 h-3" />
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 console-panel">
                <div className="text-[10px] font-mono text-[var(--muted)] mb-2">PUBLIC — GenLayer on-chain</div>
                <div className="space-y-1.5">
                  {[
                    '0x7a3f8c2d1e9b4a6f…',
                    '0x2e1d9f4b8c7a3e6d…',
                    '0x9b4c7e2f1a8d3b5c…',
                  ].map((hash, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--muted)] opacity-50">{i + 1}.</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--console-text)' }}>{hash}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What this is NOT */}
      <section className="px-8 py-20 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
              Not Escrow. Not a Court. Not Legal Advice.
            </h2>
            <p className="text-sm text-[var(--muted)] max-w-xl mx-auto">
              Contradiction Protocol is a specific tool for a specific problem. Understanding what it is not
              is as important as understanding what it is.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-4 h-4 text-[var(--danger)]" />
                <h3 className="text-sm font-semibold text-[var(--danger)]">This is NOT</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Normal escrow — it does not hold or release funds',
                  'A court replacement or legal arbitration system',
                  'Legal advice of any kind',
                  'A DeFi protocol or token staking product',
                  'Automatic contract enforcement',
                  'A private document storage service',
                  'A guarantee of legal finality',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                    <X className="w-3 h-3 text-[var(--danger)] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold" style={{ color: '#1f5e3a' }}>This IS</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'A GenLayer-native assumption commitment protocol',
                  'A selective disclosure dApp for private agreement clauses',
                  'A contradiction review workflow using AI-consensus',
                  'A privacy-preserving reveal system using hash commitments',
                  'An interpretive layer for changed real-world conditions',
                  'A structured verdict system with actionable outcomes',
                  'A demonstration of GenLayer intelligent interpretation',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                    <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy model */}
      <section className="px-8 py-20 border-t border-[var(--border)]" style={{ background: 'var(--panel)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] text-xs text-[var(--muted)] mb-6">
            <Shield className="w-3 h-3" /> Privacy model
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Private by Default
          </h2>
          <p className="text-sm text-[var(--muted)] max-w-xl mx-auto mb-10">
            Only one assumption is ever revealed — the one that matters. Everything else stays sealed.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              {
                label: 'Revealed',
                color: 'var(--accent)',
                items: ['The affected assumption', 'Its salt (proves membership)', 'Supporting evidence', 'Requested remedy'],
                icon: Unlock,
              },
              {
                label: 'Always Private',
                color: 'var(--primary)',
                items: ['All other assumptions', 'Other salts and texts', 'Unrelated evidence', 'Private negotiation notes'],
                icon: Lock,
              },
              {
                label: 'Public on GenLayer',
                color: 'var(--verdict-gold)',
                items: ['Agreement summary', 'Commitment hashes only', 'Verdict and reasoning', 'Resolution status'],
                icon: Scale,
              },
            ].map(col => (
              <div key={col.label} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <col.icon className="w-4 h-4" style={{ color: col.color }} />
                  <span className="text-xs font-semibold" style={{ color: col.color }}>{col.label}</span>
                </div>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item} className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: col.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 border-t border-[var(--border)] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Ready to enter the protocol?
          </h2>
          <p className="text-sm text-[var(--muted)] mb-8 leading-relaxed">
            Connect an injected wallet, create a private assumption-based agreement, and let GenLayer
            consensus interpret the contradiction when reality changes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[#1a2e29] transition-colors text-sm"
            >
              Enter Protocol <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/app/playground"
              className="flex items-center gap-2 px-7 py-3.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] font-medium hover:bg-[var(--primary-soft)] transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              View Consensus Flow
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--primary)] flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-[var(--muted)]">Contradiction Protocol</span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Not legal advice · Not court replacement · Not normal escrow · Powered by GenLayer
          </p>
        </div>
      </footer>

    </div>
  );
}
