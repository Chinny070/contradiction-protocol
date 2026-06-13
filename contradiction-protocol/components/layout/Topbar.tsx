'use client';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { genlayerStudionet } from '@/lib/genlayer/chains';
import { Wallet, Unplug, AlertTriangle } from 'lucide-react';

function short(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Topbar({ title }: { title?: string }) {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== genlayerStudionet.id;

  return (
    <header className="h-14 flex items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--panel)]">
      <div className="text-sm font-semibold text-[var(--text)]">{title || 'Contradiction Protocol'}</div>

      <div className="flex items-center gap-2">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => disconnect()}
            >
              <Unplug className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            loading={isPending}
            onClick={() => connect({ connector: injected() })}
          >
            <Wallet className="w-3.5 h-3.5" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
