'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { fromNow } from '@/lib/utils/dates';
import { Eye, ExternalLink } from 'lucide-react';

type EvidenceEntry = { title: string; type: string; url: string; summary: string };
type RevealRecord = {
  id: string;
  agreementId: string;
  evidence: EvidenceEntry[];
  createdAt: number;
  status: string;
};

export default function EvidenceRoomPage() {
  const { id } = useParams<{ id: string }>();
  const [reveal, setReveal] = useState<RevealRecord | null>(null);

  useEffect(() => {
    const all: RevealRecord[] = JSON.parse(localStorage.getItem('cp:reveals') || '[]');
    setReveal(all.find(r => r.id === id) || null);
  }, [id]);

  if (!reveal) {
    return (
      <EmptyState
        icon={<Eye className="w-12 h-12" />}
        title="Evidence room not found"
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto slide-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Evidence Room
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Reveal {id} · {fromNow(reveal.createdAt)}
          </p>
        </div>
        <Link href={`/app/reveals/${id}/review`}>
          <Button variant="secondary">
            <Eye className="w-3.5 h-3.5" />
            View Review
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {reveal.evidence.map((ev, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="blue">{ev.type}</Badge>
                  <h3 className="text-sm font-semibold">{ev.title}</h3>
                </div>
                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[var(--evidence-blue)] hover:underline mb-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {ev.url}
                  </a>
                )}
                <p className="text-sm text-[var(--muted)] leading-relaxed">{ev.summary}</p>
              </div>
              <div className="text-xs text-[var(--muted)] whitespace-nowrap">Item {i + 1}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
