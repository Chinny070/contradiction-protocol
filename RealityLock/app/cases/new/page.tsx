'use client';

import Link from 'next/link';
import CreateCaseForm from '@/components/forms/CreateCaseForm';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

export default function NewCasePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className="flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: 'var(--rl-border)', background: 'rgba(8,10,13,0.9)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rl-violet)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              className="text-lg font-semibold tracking-wider"
              style={{ color: '#fff', fontFamily: 'var(--font-display)' }}
            >
              RealityLock
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/cases"
            className="text-sm"
            style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
          >
            Cases
          </Link>
          <WalletConnectButton />
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-8 py-8">
        <Link
          href="/cases"
          className="text-xs mb-6 inline-block"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-mono)' }}
        >
          &larr; Back to Cases
        </Link>

        <h1
          className="text-2xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
        >
          Create New Case
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)' }}
        >
          Define the agreement dispute and name the parties involved.
        </p>

        <div
          className="p-6 rounded-lg border"
          style={{
            background: 'var(--rl-glass)',
            borderColor: 'var(--rl-border)',
          }}
        >
          <CreateCaseForm />
        </div>
      </main>
    </div>
  );
}
