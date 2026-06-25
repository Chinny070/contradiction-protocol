'use client';

import { useState, useEffect } from 'react';
import { getAccount, getCurrentChainId, switchToStudioNet } from '@/lib/genlayer/client';
import { STUDIONET } from '@/lib/genlayer/network';

export default function WalletConnectButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);

  const isCorrectChain = chainId === STUDIONET.chainId;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    let cancelled = false;

    const sync = async () => {
      const acc = await getAccount();
      const chain = await getCurrentChainId();
      if (!cancelled) {
        setAccount(acc);
        setChainId(chain);
      }
    };

    sync();

    const handleChange = () => { sync(); };
    window.ethereum.on('accountsChanged', handleChange);
    window.ethereum.on('chainChanged', handleChange);
    return () => {
      cancelled = true;
      window.ethereum?.removeListener('accountsChanged', handleChange);
      window.ethereum?.removeListener('chainChanged', handleChange);
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or a compatible wallet.');
      return;
    }
    setConnecting(true);
    try {
      const acc = await getAccount();
      setAccount(acc);
      const chain = await getCurrentChainId();
      setChainId(chain);
      if (chain !== STUDIONET.chainId) {
        await switchToStudioNet();
        setChainId(STUDIONET.chainId);
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleSwitch = async () => {
    await switchToStudioNet();
    const chain = await getCurrentChainId();
    setChainId(chain);
  };

  if (!account) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200"
        style={{
          background: 'rgba(125,249,255,0.1)',
          borderColor: 'var(--rl-cyan)',
          color: 'var(--rl-cyan)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  if (!isCorrectChain) {
    return (
      <button
        onClick={handleSwitch}
        className="px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200"
        style={{
          background: 'rgba(255,77,109,0.1)',
          borderColor: 'var(--rl-red)',
          color: 'var(--rl-red)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        Switch to StudioNet
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm"
      style={{
        background: 'var(--rl-glass)',
        borderColor: 'var(--rl-border)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: 'var(--rl-green)' }}
      />
      <span style={{ color: 'var(--rl-muted)' }}>
        {account.slice(0, 6)}...{account.slice(-4)}
      </span>
    </div>
  );
}
