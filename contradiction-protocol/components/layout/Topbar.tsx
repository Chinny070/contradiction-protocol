'use client';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useConnectors, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { genlayerStudionet } from '@/lib/genlayer/chains';
import { DEMO_MODE, DEMO_ADDRESS } from '@/lib/config/demo';
import { Wallet, Unplug, AlertTriangle, FlaskConical } from 'lucide-react';

function short(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Topbar({ title }: { title?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== genlayerStudionet.id;

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--panel)]">
      <div className="text-sm font-semibold text-[var(--text)]">{title || 'Contradiction Protocol'}</div>

      <div className="flex items-center gap-2">
        {DEMO_MODE ? (
          // Demo mode — no wallet probing, no Connect button
          <>
            <Badge variant="muted">
              <FlaskConical className="w-3 h-3" />
              Demo
            </Badge>
            <span className="text-xs text-[var(--muted)] font-mono">{short(DEMO_ADDRESS)}</span>
          </>
        ) : mounted ? (
          // Live mode — only render wallet UI after hydration to avoid SSR mismatch
          <>
            {wrongNetwork && (
              <button
                onClick={() => switchChain({ chainId: genlayerStudionet.id })}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5dcd9] text-[var(--danger)] text-xs font-medium"
              >
                <AlertTriangle className="w-3 h-3" />
                Wrong Network — Switch
              </button>
            )}

            {isConnected && !wrongNetwork && (
              <Badge variant="success">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                GenLayer Studionet
              </Badge>
            )}

            {isConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)] font-mono">{short(address!)}</span>
                <Button variant="ghost" size="sm" onClick={() => disconnect({ connector: connectors[0] })}>
                  <Unplug className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                loading={isPending}
                onClick={() => connect({ connector: connectors[0] })}
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect Wallet
              </Button>
            )}
          </>
        ) : null}
      </div>
    </header>
  );
}
