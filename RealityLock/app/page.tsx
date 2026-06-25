import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--rl-border)', background: 'rgba(8,10,13,0.95)' }}
      >
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rl-violet)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span
            className="text-base tracking-wide"
            style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
          >
            RealityLock
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/demo"
            className="text-sm"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
          >
            Example
          </Link>
          <Link
            href="/cases"
            className="text-sm px-5 py-2 rounded-md border transition-colors"
            style={{
              borderColor: 'var(--rl-cyan)',
              color: 'var(--rl-cyan)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Open Case
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center px-8 pt-28 pb-20">
          <div className="max-w-2xl text-center">
            <div
              className="inline-block px-4 py-1.5 rounded-full border mb-10 text-[11px] tracking-[0.2em] uppercase"
              style={{
                borderColor: 'rgba(155,92,255,0.35)',
                color: 'var(--rl-violet)',
                background: 'rgba(155,92,255,0.06)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Powered by GenLayer
            </div>

            <h1
              className="text-4xl md:text-6xl leading-[1.15] mb-8"
              style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
            >
              When memories conflict,
              <br />
              <span style={{ color: 'var(--rl-cyan)' }}>RealityLock decides.</span>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-14"
              style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)', lineHeight: '1.75' }}
            >
              Agreements rarely fail because people forget.
              <br />
              They fail because people remember differently.
              <br />
              <span className="mt-3 block" style={{ color: 'rgba(255,255,255,0.55)' }}>
                RealityLock reconstructs agreements from messages, documents, screenshots,
                and evidence — then seals the canonical agreement state through GenLayer.
              </span>
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/cases"
                className="px-8 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'rgba(125,249,255,0.1)',
                  color: 'var(--rl-cyan)',
                  border: '1px solid rgba(125,249,255,0.5)',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                Open Case
              </Link>
              <Link
                href="#example"
                className="px-8 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'transparent',
                  color: 'var(--rl-muted)',
                  border: '1px solid var(--rl-border)',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                See Example Verdict
              </Link>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="max-w-4xl mx-auto px-8 py-20">
          <h2
            className="text-[11px] tracking-[0.2em] uppercase text-center mb-14"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
          >
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Create Case',
                desc: 'Define the agreement, parties, and what is being disputed.',
                color: 'var(--rl-cyan)',
              },
              {
                step: '02',
                title: 'Submit Evidence',
                desc: 'Upload screenshots, messages, commits, files, and supporting context.',
                color: 'var(--rl-amber)',
              },
              {
                step: '03',
                title: 'Reconstruct Reality',
                desc: 'GenLayer analyzes contradictions and determines what was actually agreed.',
                color: 'var(--rl-violet)',
              },
              {
                step: '04',
                title: 'Seal Canonical Verdict',
                desc: 'The final agreement state becomes auditable and verifiable.',
                color: 'var(--rl-green)',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-lg border"
                style={{
                  background: 'var(--rl-glass)',
                  borderColor: 'var(--rl-border)',
                }}
              >
                <span
                  className="text-xs tracking-[0.15em] uppercase"
                  style={{ color: item.color, fontFamily: 'var(--font-mono)' }}
                >
                  Step {item.step}
                </span>
                <h3
                  className="text-base font-medium mt-3 mb-2"
                  style={{ color: '#fff', fontFamily: 'var(--font-ui)' }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Example Resolution */}
        <section id="example" className="max-w-3xl mx-auto px-8 pt-12 pb-28">
          <h2
            className="text-[11px] tracking-[0.2em] uppercase text-center mb-14"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
          >
            Example Resolution
          </h2>

          {/* Claims */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {/* Builder claim */}
            <div
              className="p-6 rounded-lg border"
              style={{
                background: 'var(--rl-glass)',
                borderColor: 'var(--rl-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--rl-cyan)' }}
                />
                <span
                  className="text-[10px] tracking-[0.15em] uppercase"
                  style={{ color: 'var(--rl-cyan)', fontFamily: 'var(--font-mono)' }}
                >
                  Builder Claim
                </span>
              </div>
              <p
                className="text-lg leading-snug"
                style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
              >
                &ldquo;Dashboard excluded from scope.&rdquo;
              </p>
            </div>

            {/* Client claim */}
            <div
              className="p-6 rounded-lg border"
              style={{
                background: 'var(--rl-glass)',
                borderColor: 'var(--rl-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--rl-red)' }}
                />
                <span
                  className="text-[10px] tracking-[0.15em] uppercase"
                  style={{ color: 'var(--rl-red)', fontFamily: 'var(--font-mono)' }}
                >
                  Client Claim
                </span>
              </div>
              <p
                className="text-lg leading-snug"
                style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
              >
                &ldquo;Dashboard was included.&rdquo;
              </p>
            </div>
          </div>

          {/* Verdict */}
          <div
            className="rounded-lg border relative overflow-hidden"
            style={{
              background: 'var(--rl-glass)',
              borderColor: 'var(--rl-violet)',
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--rl-violet), transparent)',
              }}
            />

            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rl-violet)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span
                  className="text-[10px] tracking-[0.15em] uppercase"
                  style={{ color: 'var(--rl-violet)', fontFamily: 'var(--font-mono)' }}
                >
                  Canonical Verdict
                </span>
              </div>

              <pre
                className="text-sm leading-relaxed overflow-x-auto"
                style={{
                  color: 'var(--rl-cyan)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
{`{
  "decision": "Dashboard excluded from scope",
  "confidence": "HIGH",
  "reason": "Evidence timeline supports exclusion.
              Later messages confirm login-only scope.
              No binding agreement for dashboard found."
}`}
              </pre>
            </div>
          </div>

          <p
            className="text-center mt-8 text-sm"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
          >
            This is what a sealed verdict looks like.{' '}
            <Link
              href="/demo"
              className="underline"
              style={{ color: 'var(--rl-cyan)' }}
            >
              View full example with evidence
            </Link>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-8 border-t"
        style={{ borderColor: 'var(--rl-border)' }}
      >
        <p
          className="text-xs"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)', opacity: 0.6 }}
        >
          RealityLock — Agreement reconstruction on GenLayer
        </p>
      </footer>
    </div>
  );
}
