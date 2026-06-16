'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getReveal } from '@/lib/firebase/reveals';
import type { RevealRecord } from '@/lib/firebase/reveals';
import { fromNow } from '@/lib/utils/dates';
import { Eye, ExternalLink, Lock, Hash, FileText, Link2, AlertTriangle } from 'lucide-react';

const typeIcon: Record<string, React.ReactNode> = {
  URL: <Link2 className="w-3.5 h-3.5" />,
  WEB_REFERENCE: <Link2 className="w-3.5 h-3.5" />,
  TEXT_STATEMENT: <FileText className="w-3.5 h-3.5" />,
  OFFICIAL_NOTICE: <AlertTriangle className="w-3.5 h-3.5" />,
  DOCUMENT_HASH: <Hash className="w-3.5 h-3.5" />,
  COUNTERPARTY_RESPONSE: <Lock className="w-3.5 h-3.5" />,
};

export default function EvidenceRoomPage() {
  const { id } = useParams<{ id: string }>();
  const [reveal, setReveal] = useState<RevealRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReveal(id as string).then(r => {
      setReveal(r);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-sm text-[var(--muted)]">Loading evidence room…</div>;
  }

  if (!reveal) {
    return (
      <EmptyState
        icon={<Eye className="w-12 h-12" />}
        title="Evidence room not found"
        description="This reveal record could not be located."
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto slide-up space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Evidence Room
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Reveal {id} · {fromNow(reveal.createdAt)}
          </p>
        </div>
        <Link href={`/app/reveals/${id}/review`}>
          <Button variant="secondary" size="sm">
            <Eye className="w-3.5 h-3.5" />
            View Review
          </Button>
        </Link>
      </div>

      {/* Revealed assumption context */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-3.5 h-3.5 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--accent)]">Revealed Assumption</h3>
          <Badge variant="accent">{reveal.requestedAction}</Badge>
        </div>
        <p className="text-sm text-[var(--text)] leading-relaxed">{reveal.revealedAssumptionText}</p>
        <div className="mt-2">
          <span className="text-[10px] font-mono text-[var(--muted)]">commitment: </span>
          <span className="hash-text text-[10px]">{reveal.assumptionCommitment}</span>
        </div>
      </Card>

      {/* Evidence count */}
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-[var(--evidence-blue)]" />
        <h2 className="text-sm font-semibold">Evidence Items</h2>
        <Badge variant="blue">{reveal.evidence.length}</Badge>
      </div>

      {reveal.evidence.length === 0 ? (
        <EmptyState
          icon={<Eye className="w-10 h-10" />}
          title="No evidence submitted"
          description="Evidence items submitted with the reveal will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reveal.evidence.map((ev, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--evidence-blue)20', color: 'var(--evidence-blue)' }}
                    >
                      {typeIcon[ev.type] ?? <FileText className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">{ev.title || `Evidence ${i + 1}`}</h3>
                      <Badge variant="blue" className="mt-0.5">{ev.type}</Badge>
                    </div>
                  </div>

                  {/* URL */}
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[var(--evidence-blue)] hover:underline mb-3 break-all"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {ev.url}
                    </a>
                  )}

                  {/* Summary */}
                  <p className="text-sm text-[var(--text)] leading-relaxed">{ev.summary}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-[10px] text-[var(--muted)] font-mono">#{i + 1}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Counterparty counter-evidence if available */}
      {reveal.counterpartyResponse && reveal.counterpartyResponse.counterEvidence.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <Lock className="w-4 h-4 text-[var(--muted)]" />
            <h2 className="text-sm font-semibold">Counterparty Counter-Evidence</h2>
            <Badge variant="muted">{reveal.counterpartyResponse.counterEvidence.length}</Badge>
          </div>
          <div className="space-y-3">
            {reveal.counterpartyResponse.counterEvidence.map((ev, i) => (
              <Card key={i} className="p-4 border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="muted">{ev.type}</Badge>
                  <span className="text-sm font-medium">{ev.title}</span>
                </div>
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[var(--evidence-blue)] hover:underline mb-2 break-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {ev.url}
                  </a>
                )}
                <p className="text-sm text-[var(--muted)] leading-relaxed">{ev.summary}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
