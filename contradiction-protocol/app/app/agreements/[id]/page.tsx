'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, WaxSealBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAssumptionsForAgreement } from '@/lib/vault/localVault';
import { getAgreement } from '@/lib/firebase/agreements';
import { getRevealsForAgreement } from '@/lib/firebase/reveals';
import type { AgreementRecord } from '@/lib/firebase/agreements';
import type { RevealRecord } from '@/lib/firebase/reveals';
import { fromNow, formatDateTime } from '@/lib/utils/dates';
import { Lock, Unlock, Hash, Shield, ChevronRight, Eye, ArrowRight } from 'lucide-react';
import type { PrivateAssumption } from '@/types';

export default function AgreementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [reveals, setReveals] = useState<RevealRecord[]>([]);
  const [localAssumptions, setLocalAssumptions] = useState<PrivateAssumption[]>([]);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AgreementDetail] fetching id:', id);
    Promise.allSettled([
      getAgreement(id as string),
      getRevealsForAgreement(id as string),
      getAssumptionsForAgreement(id as string),
    ]).then(([agrResult, revsResult, vaultResult]) => {
      console.log('[AgreementDetail] agrResult:', agrResult);
      if (agrResult.status === 'fulfilled') setAgreement(agrResult.value);
      else console.error('[AgreementDetail] Failed to load agreement:', agrResult.reason);

      if (revsResult.status === 'fulfilled') setReveals(revsResult.value);
      else console.warn('[AgreementDetail] Failed to load reveals:', revsResult.reason);

      if (vaultResult.status === 'fulfilled') setLocalAssumptions(vaultResult.value);
      else console.warn('[AgreementDetail] Failed to load vault:', vaultResult.reason);

      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-[var(--muted)]">Loading agreement…</div>;
  }

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

          {/* Reveals Feed */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-sm font-semibold">Reveals</span>
              <Badge variant="muted" className="ml-auto">{reveals.length}</Badge>
            </div>
            {reveals.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                No reveals submitted yet.{' '}
                <Link href={`/app/agreements/${id}/reveal`} className="underline text-[var(--accent)]">
                  Reveal an assumption
                </Link>{' '}
                if reality has changed.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {reveals.map(r => (
                  <Link
                    key={r.id}
                    href={`/app/reveals/${r.id}/review`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--primary-soft)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <WaxSealBadge status={r.verdictJson ? 'DECIDED' : r.status} />
                        <span className="text-xs text-[var(--muted)]">{fromNow(r.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[var(--text)] truncate">{r.revealedAssumptionText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="accent">{r.requestedAction}</Badge>
                        {r.verdictJson && (
                          <Badge variant={
                            r.verdictJson.recommendedAction === 'REJECT_CLAIM' ? 'danger' :
                            r.verdictJson.materiality === 'HIGH' ? 'gold' : 'blue'
                          }>
                            {r.verdictJson.recommendedAction} / {r.verdictJson.materiality}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
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
              {reveals.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <div>
                    <div className="text-xs font-medium">Assumption Revealed</div>
                    <div className="text-[10px] text-[var(--muted)]">{fromNow(reveals[0].createdAt)}</div>
                  </div>
                </div>
              )}
              {reveals.some(r => r.verdictJson) && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--verdict-gold)]" />
                  <div>
                    <div className="text-xs font-medium">Verdict Issued</div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {reveals.find(r => r.verdictJson)?.verdictJson?.recommendedAction}
                    </div>
                  </div>
                </div>
              )}
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
