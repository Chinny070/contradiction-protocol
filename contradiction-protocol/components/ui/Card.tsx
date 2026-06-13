import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'panel' | 'console';
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        variant === 'default' && 'bg-[var(--panel)] border-[var(--border)]',
        variant === 'panel' && 'bg-[var(--bg)] border-[var(--border)]',
        variant === 'console' && 'console-panel rounded-xl border border-[rgba(233,224,206,0.1)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
