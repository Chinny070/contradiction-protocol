import { cn } from '@/lib/utils/cn';
import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[var(--text)]">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-[var(--panel)] text-[var(--text)] text-sm',
          'border-[var(--border)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
          'transition-all duration-150 cursor-pointer',
          error && 'border-[var(--danger)]',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
