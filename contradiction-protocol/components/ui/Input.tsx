import { cn } from '@/lib/utils/cn';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[var(--text)]">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-[var(--panel)] text-[var(--text)] text-sm',
          'border-[var(--border)] placeholder:text-[var(--muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
          'transition-all duration-150',
          error && 'border-[var(--danger)] focus:ring-[var(--danger)]',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[var(--text)]">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-[var(--panel)] text-[var(--text)] text-sm',
          'border-[var(--border)] placeholder:text-[var(--muted)] resize-none',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
          'transition-all duration-150',
          error && 'border-[var(--danger)] focus:ring-[var(--danger)]',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
