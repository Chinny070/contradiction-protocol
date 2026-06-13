'use client';
import { cn } from '@/lib/utils/cn';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--primary)] text-white hover:bg-[#1a2e29] border border-transparent',
  secondary: 'bg-[var(--panel)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--primary-soft)]',
  ghost: 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--primary-soft)] border border-transparent',
  danger: 'bg-[var(--danger)] text-white hover:bg-[#6d2419] border border-transparent',
  accent: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
