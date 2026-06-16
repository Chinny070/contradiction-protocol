'use client';
import { useAccount, useConnect, useConnectors, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { genlayerStudionet } from '@/lib/genlayer/chains';
import { Wallet, Network, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const onCorrectNetwork = chainId === genlayerStudionet.id;

  return (
    <div className="max-w-xl mx-auto slide-up space-y-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
          Settings
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">Wallet, network, and local vault settings.</p>
      </div>

      {/* Wallet */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[var(--muted)]" />
          <h2 className="text-sm font-semibold">Wallet Connection</h2>
        </div>
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">Connected address</span>
              <span className="font-mono text-xs">{address?.slice(0, 10)}…{address?.slice(-6)}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => disconnect({ connector: connectors[0] })}>
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Connect an injected wallet (MetaMask or similar) to use the protocol.
            </p>
            <Button loading={isPending} onClick={() => connect({ connector: connectors[0] })}>
              <Wallet className="w-3.5 h-3.5" />
              Connect Injected Wallet
            </Button>
          </div>
        )}
      </Card>

      {/* Network */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[var(--muted)]" />
          <h2 className="text-sm font-semibold">Network Status</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">Required network</span>
            <Badge variant="primary">GenLayer Studionet (ID: 761)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">Current network</span>
            {isConnected ? (
              onCorrectNetwork
                ? <Badge variant="success"><CheckCircle className="w-3 h-3" /> Connected</Badge>
                : <Badge variant="danger"><AlertTriangle className="w-3 h-3" /> Wrong Network</Badge>
            ) : (
              <span className="text-xs text-[var(--muted)]">Not connected</span>
            )}
          </div>
          {isConnected && !onCorrectNetwork && (
            <Button size="sm" onClick={() => switchChain({ chainId: genlayerStudionet.id })}>
              Switch to GenLayer Studionet
            </Button>
          )}
        </div>
        <div className="text-xs text-[var(--muted)]">
          RPC: {process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'http://localhost:4000/api'}
        </div>
      </Card>

      {/* Vault info */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--muted)]" />
          <h2 className="text-sm font-semibold">Local Vault</h2>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Private assumptions are stored in IndexedDB in your browser.
          They are never sent to any server. Export a backup before clearing browser data.
        </p>
        <Button variant="secondary" size="sm" onClick={() => window.location.href = '/app/vault'}>
          Open Vault Manager
        </Button>
      </Card>

      {/* Legal */}
      <Card className="p-5 space-y-2 bg-[var(--bg)]">
        <h2 className="text-sm font-semibold">Legal Disclaimer</h2>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Contradiction Protocol is an experimental GenLayer-native adjudication dApp.
          It is not legal advice, not a court replacement, and not normal escrow.
          AI-validator consensus verdicts are interpretive outputs, not legally binding judgements.
          Always seek qualified legal counsel for actual contractual disputes.
        </p>
        <Badge variant="muted">Acknowledged</Badge>
      </Card>
    </div>
  );
}
