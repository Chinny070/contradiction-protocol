import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'gold' | 'blue' | 'danger' | 'muted' | 'success';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--primary-soft)] text-[var(--primary)]',
  primary: 'bg-[var(--primary)] text-white',
  accent: 'bg-[var(--accent)] text-white',
  gold: 'bg-[#f5e9c8] text-[var(--verdict-gold)] border border-[var(--verdict-gold)]',
  blue: 'bg-[#dde8ef] text-[var(--evidence-blue)] border border-[var(--evidence-blue)]',
  danger: 'bg-[#f5dcd9] text-[var(--danger)] border border-[var(--danger)]',
  muted: 'bg-[var(--border)] text-[var(--muted)]',
  success: 'bg-[#d2e8d8] text-[#1f5e3a]',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function WaxSealBadge({ status, className }: { status: string; className?: string }) {
  const map: Record<string, { emoji: string; variant: BadgeVariant }> = {
    DRAFT: { emoji: '○', variant: 'muted' },
    COMMITTED: { emoji: '◈', variant: 'primary' },
    ACTIVE: { emoji: '●', variant: 'success' },
    CHALLENGED: { emoji: '◉', variant: 'accent' },
    PAUSED: { emoji: '⏸', variant: 'gold' },
    RENEGOTIATION_REQUESTED: { emoji: '↺', variant: 'blue' },
    SETTLED: { emoji: '✓', variant: 'success' },
    CLOSED: { emoji: '■', variant: 'muted' },
    SUBMITTED: { emoji: '→', variant: 'blue' },
    COMMITMENT_VERIFIED: { emoji: '✓', variant: 'success' },
    UNDER_REVIEW: { emoji: '◎', variant: 'gold' },
    DECIDED: { emoji: '⊛', variant: 'primary' },
    REJECTED: { emoji: '✗', variant: 'danger' },
  };
  const s = map[status] || { emoji: '?', variant: 'muted' as BadgeVariant };
  return (
    <Badge variant={s.variant} className={className}>
      <span>{s.emoji}</span>
      <span>{status.replace(/_/g, ' ')}</span>
    </Badge>
  );
}
