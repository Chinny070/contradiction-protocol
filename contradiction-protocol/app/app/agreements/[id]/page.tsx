'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, WaxSealBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAssumptionsForAgreement } from '@/lib/vault/localVault';
import { fromNow, formatDateTime } from '@/lib/utils/dates';
import { Lock, Unlock, Hash, Shield, ChevronRight, Eye } from 'lucide-react';
import type { PrivateAssumption } from '@/types';

type AgreementRecord = {
  id: string;
  title: string;
  creator: string;
  counterparty: string;
  agreementSummary: string;
  agreementRoot: string;
  assumptionsRoot: string;
  assumptionCount: number;
  status: string;
  createdAt: number;
  commitments: string[];
};

export default function AgreementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [localAssumptions, setLocalAssumptions] = useState<PrivateAssumption[]>([]);
  const [vaultOpen, setVaultOpen] = useState(false);

  useEffect(() => {
    const all: AgreementRecord[] = JSON.parse(localStorage.getItem('cp:agreements') || '[]');
    const found = all.find(a => a.id === id);
    setAgreement(found || null);
    getAssumptionsForAgreement(id as string).then(setLocalAssumptions);
  }, [id]);

  if (!agreement) {
    return (
      <EmptyState
        icon={<Shield className="w-12 h-12" />}
        title="Agreement not found"
        description="This agreement may not exist or was created on a different device."
        action={<Link href="/app"><Button variant="secondary">Back to Dashboard</Button></Link>}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/app" className="text-xs text-[var(--muted)] hover:text-[var(--text)]">Dashboard</Link>
            <ChevronRight className="w-3 h-3 text-[var(--muted)]" />
            <span className="text-xs text-[var(--muted)]">Agreements</span>
          </div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            {agreement.title}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <WaxSealBadge status={agreement.status} />
            <span className="text-xs text-[var(--muted)]">Created {fromNow(agreement.createdAt)}</span>
          </div>
        </div>
        <Link href={`/app/agreements/${id}/reveal`}>
          <Button>
            <Unlock className="w-3.5 h-3.5" />
            Reveal Assumption
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main */}
        <div className="col-span-2 space-y-4">
          {/* Summary */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">Agreement Summary</h3>
            <p className="text-sm text-[var(--text)] leading-relaxed">{agreement.agreementSummary}</p>
            <Badge variant="muted" className="mt-3">
              <Eye className="w-3 h-3" /> Public on GenLayer
            </Badge>
          </Card>

          {/* Commitment Roots */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-[var(--muted)]" />
              <h3 className="text-sm font-semibold">Commitment Roots</h3>
            </div>
            {[
              { label: 'agreementRoot', value: agreement.agreementRoot },
              { label: 'assumptionsRoot', value: agreement.assumptionsRoot },
            ].map(r => (
              <div key={r.label}>
                <div className="text-[10px] text-[var(--muted)] font-mono mb-0.5">{r.label}</div>
                <div className="hash-text bg-[var(--bg)] rounded px-2 py-1.5">{r.value}</div>
              </div>
            ))}
          </Card>

          {/* Assumption Commitments */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="text-sm font-semibold">Assumption Commitments</span>
              <Badge variant="muted" className="ml-auto">{agreement.commitments.length}</Badge>
            </div>
            {agreement.commitments.map((c, i) => (
              <div key={i} className="px-4 py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[var(--muted)]">Commitment {i + 1}</span>
                  <Badge variant="muted">PRIVATE</Badge>
                </div>
                <div className="hash-text">{c}</div>
              </div>
            ))}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Parties */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Parties</h3>
            {[
              { role: 'Creator', addr: agreement.creator },
              { role: 'Counterparty', addr: agreement.counterparty },
            ].map(p => (
              <div key={p.role}>
                <div className="text-[10px] text-[var(--muted)] mb-0.5">{p.role}</div>
                <div className="font-mono text-xs text-[var(--text)] break-all">{p.addr}</div>
              </div>
            ))}
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Status Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                <div>
                  <div className="text-xs font-medium">Committed</div>
                  <div className="text-[10px] text-[var(--muted)]">{formatDateTime(agreement.createdAt)}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Local Vault Drawer */}
          <Card className="overflow-hidden">
            <button
              className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-[var(--primary-soft)] transition-colors border-b border-[var(--border)]"
              onClick={() => setVaultOpen(v => !v)}
            >
              <Shield className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-sm font-semibold flex-1">Local Assumption Vault</span>
              <Badge variant="muted">{localAssumptions.length}</Badge>
              <span className="text-[var(--muted)] text-xs">{vaultOpen ? '▲' : '▼'}</span>
            </button>
            {vaultOpen && (
              <div className="divide-y divide-[var(--border)]">
                {localAssumptions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[var(--muted)]">No local assumptions found.</div>
                ) : localAssumptions.map(a => (
                  <div key={a.localId} className="px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lock className="w-3 h-3 text-[var(--muted)]" />
                      <span className="text-xs font-medium">{a.title}</span>
                    </div>
                    <div className="hash-text">{a.commitment.slice(0, 32)}…</div>
                    <div className="mt-1">
                      <Badge variant="muted">{a.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
