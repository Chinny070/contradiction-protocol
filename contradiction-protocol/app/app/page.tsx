'use client';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DEMO_MODE, DEMO_ADDRESS } from '@/lib/config/demo';
import { Card } from '@/components/ui/Card';
import { Badge, WaxSealBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText, Unlock, Eye, RefreshCw, CheckCircle,
  Shield, Plus, ArrowRight, Activity
} from 'lucide-react';
import { fromNow } from '@/lib/utils/dates';
import { getAllAgreements } from '@/lib/firebase/agreements';
import { getAllReveals } from '@/lib/firebase/reveals';
import type { AgreementRecord } from '@/lib/firebase/agreements';
import type { RevealRecord } from '@/lib/firebase/reveals';

type FeedEntry = {
  type: string; label: string; href: string; time: string; status: string;
};

function buildFeed(agreements: AgreementRecord[], reveals: RevealRecord[]): FeedEntry[] {
  const entries: FeedEntry[] = [];

  for (const a of agreements) {
    entries.push({
      type: 'AGREEMENT_COMMITTED',
      label: a.title,
      href: `/app/agreements/${a.id}`,
      time: fromNow(a.createdAt),
      status: a.status,
    });
  }

  for (const r of reveals) {
    const agr = agreements.find(a => a.id === r.agreementId);
    entries.push({
      type: r.verdictJson ? 'VERDICT' : r.status === 'UNDER_REVIEW' ? 'GENLAYER_REVIEW' : 'ASSUMPTION_REVEALED',
      label: r.verdictJson
        ? `${r.verdictJson.recommendedAction} / ${r.verdictJson.materiality} MATERIALITY`
        : `Reveal on: ${agr?.title ?? r.agreementId}`,
      href: `/app/reveals/${r.id}/review`,
      time: fromNow(r.createdAt),
      status: r.verdictJson ? 'DECIDED' : r.status,
    });
  }

  return entries.sort((a, b) => 0);
}

const typeIcon: Record<string, React.ReactNode> = {
  AGREEMENT_COMMITTED: <FileText className="w-3.5 h-3.5" />,
  ASSUMPTION_REVEALED: <Unlock className="w-3.5 h-3.5" />,
  GENLAYER_REVIEW: <Eye className="w-3.5 h-3.5" />,
  VERDICT: <CheckCircle className="w-3.5 h-3.5" />,
};

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);
  const [reveals, setReveals] = useState<RevealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    Promise.all([getAllAgreements(), getAllReveals()])
      .then(([agrs, revs]) => {
        setAgreements(agrs);
        setReveals(revs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mounted]);

  if (!mounted) return null;
  if (!DEMO_MODE && !isConnected) {
    return (
      <EmptyState
        icon={<Shield className="w-12 h-12" />}
        title="Connect your wallet to enter the protocol"
        description="Contradiction Protocol uses injected wallet authentication. Connect MetaMask or an injected provider to get started."
        action={
          <p className="text-xs text-[var(--muted)]">Click &ldquo;Connect Wallet&rdquo; in the top right corner.</p>
        }
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Protocol Dashboard
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            <span className="font-mono text-xs">{(DEMO_MODE ? DEMO_ADDRESS : address)?.slice(0, 10)}…</span> · {DEMO_MODE ? 'Demo Mode' : 'GenLayer Studionet'}
          </p>
        </div>
        <Link href="/app/agreements/new">
          <Button>
            <Plus className="w-3.5 h-3.5" />
            New Agreement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Agreements', value: String(agreements.filter(a => a.status === 'ACTIVE' || a.status === 'COMMITTED').length), icon: FileText, color: 'var(--primary)' },
          { label: 'Pending Reveals', value: String(reveals.filter(r => r.status === 'SUBMITTED' || r.status === 'COMMITMENT_VERIFIED').length), icon: Unlock, color: 'var(--accent)' },
          { label: 'Under Review', value: String(reveals.filter(r => r.status === 'UNDER_REVIEW').length), icon: Eye, color: 'var(--evidence-blue)' },
          { label: 'Renegotiation', value: String(agreements.filter(a => a.status === 'RENEGOTIATION_REQUESTED').length), icon: RefreshCw, color: 'var(--verdict-gold)' },
          { label: 'Settled', value: String(agreements.filter(a => a.status === 'SETTLED').length), icon: CheckCircle, color: '#1f5e3a' },
          { label: 'Total Agreements', value: String(agreements.length), icon: Shield, color: 'var(--muted)' },
        ].map(stat => (
          <Card key={stat.label} className="p-4 text-center">
            <div
              className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center"
              style={{ background: stat.color + '15' }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div className="text-xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5 leading-tight">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-5 gap-4">
        {/* Contradiction Feed */}
        <div className="col-span-3">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span className="text-sm font-medium">Contradiction Feed</span>
              <Badge variant="muted" className="ml-auto text-[10px]">{agreements.length + reveals.length} events</Badge>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">Loading…</div>
              ) : buildFeed(agreements, reveals).reverse().map((entry, i) => (
                <Link key={i} href={entry.href} className="px-4 py-3 flex items-center gap-3 hover:bg-[var(--primary-soft)] transition-colors">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}
                  >
                    {typeIcon[entry.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-[var(--muted)] mb-0.5">[{entry.type}]</div>
                    <div className="text-sm text-[var(--text)] truncate">{entry.label}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <WaxSealBadge status={entry.status} />
                    <span className="text-[10px] text-[var(--muted)]">{entry.time}</span>
                  </div>
                </Link>
              ))}
              {!loading && agreements.length === 0 && reveals.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                  No activity yet. Create your first agreement to get started.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="col-span-2 space-y-3">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/app/agreements/new', label: 'Create Agreement', icon: Plus },
                { href: '/app/vault', label: 'View Local Vault', icon: Shield },
                { href: '/app/playground', label: 'Consensus Playground', icon: Activity },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--primary-soft)] transition-colors text-sm"
                >
                  <action.icon className="w-3.5 h-3.5 text-[var(--muted)]" />
                  <span>{action.label}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--muted)] ml-auto" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">How It Works</h3>
            <ol className="space-y-2">
              {[
                'Commit private assumptions to GenLayer',
                'Reality changes — reveal one assumption',
                'Submit evidence of the change',
                'GenLayer consensus interprets the contradiction',
                'Verdict guides what happens next',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
