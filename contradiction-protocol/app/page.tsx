import Link from 'next/link';
import { Lock, ArrowRight, Eye, Hash, Cpu } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Contradiction Protocol
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/playground" className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            View Consensus Flow
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
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] text-xs text-[var(--muted)] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block" />
          GenLayer-native · Selective Disclosure · AI Consensus
        </div>

        <h1 className="text-5xl font-bold text-[var(--text)] max-w-2xl leading-tight mb-6" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
          Private agreements.<br />
          <span style={{ color: 'var(--accent)' }}>Selective reveals.</span><br />
          AI-consensus interpretation.
        </h1>

        <p className="text-lg text-[var(--muted)] max-w-xl leading-relaxed mb-10">
          Contradiction Protocol lets parties commit to hidden assumptions inside private agreements,
          then reveal only the affected clause if reality changes — and ask GenLayer to decide what should happen next.
        </p>

        <div className="flex items-center gap-3 mb-16">
          <Link
            href="/app"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[#1a2e29] transition-colors"
          >
            Enter Protocol <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/app/playground"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] font-medium hover:bg-[var(--primary-soft)] transition-colors"
          >
            View Consensus Flow
          </Link>
        </div>

        {/* Visual demo strip */}
        <div className="w-full max-w-4xl grid grid-cols-3 gap-4 mb-12">
          {[
            {
              icon: Hash,
              step: '01',
              title: 'Commit Assumptions',
              desc: 'Hash each private assumption with a salt. Only commitments go on-chain.',
              color: 'var(--primary)',
            },
            {
              icon: Eye,
              step: '02',
              title: 'Selective Reveal',
              desc: 'When reality changes, reveal only the affected assumption. Everything else stays private.',
              color: 'var(--accent)',
            },
            {
              icon: Cpu,
              step: '03',
              title: 'GenLayer Judges',
              desc: 'AI-validator consensus decides whether the contradiction is material and what action follows.',
              color: 'var(--verdict-gold)',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-5 text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: item.color + '20' }}
                >
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <span className="text-[10px] font-mono text-[var(--muted)]">{item.step}</span>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">{item.title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Sample verdict card */}
        <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="text-xs font-mono text-[var(--muted)]">GenLayer Verdict — example output</span>
          </div>
          <div className="p-5 console-panel rounded-b-xl text-xs leading-relaxed">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-3">
              <span className="text-[var(--muted)]">revealedClauseBelongs</span>
              <span className="text-green-400">true</span>
              <span className="text-[var(--muted)]">conditionChanged</span>
              <span className="text-green-400">true</span>
              <span className="text-[var(--muted)]">contradictionFound</span>
              <span className="text-green-400">true</span>
              <span className="text-[var(--muted)]">materiality</span>
              <span style={{ color: 'var(--verdict-gold)' }}>HIGH</span>
              <span className="text-[var(--muted)]">evidenceQuality</span>
              <span className="text-blue-400">STRONG</span>
              <span className="text-[var(--muted)]">recommendedAction</span>
              <span style={{ color: 'var(--accent)' }}>RENEGOTIATE</span>
            </div>
            <p className="text-[var(--muted)] text-[11px]">
              &quot;The revealed assumption depended on the port remaining open. The submitted evidence indicates
              the port was closed during the performance window, materially contradicting the original assumption.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="px-8 py-5 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--muted)]">
          Not legal advice. Not court replacement. Not normal escrow. · Powered by GenLayer
        </p>
      </footer>
    </div>
  );
}
