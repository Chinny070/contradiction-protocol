'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, FileText, Unlock, FlaskConical,
  Shield, Settings, ChevronRight, Lock
} from 'lucide-react';

const nav = [
  { href: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/agreements/new', icon: FileText, label: 'New Agreement' },
  { href: '/app/vault', icon: Shield, label: 'Local Vault' },
  { href: '/app/playground', icon: FlaskConical, label: 'Consensus Playground' },
  { href: '/app/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--panel)] min-h-screen">
      <div className="p-5 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--text)] font-[var(--font-space)]">Contradiction</div>
            <div className="text-[10px] text-[var(--muted)] -mt-0.5">Protocol</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                active
                  ? 'bg-[var(--primary)] text-white font-medium'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--primary-soft)]'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="px-3 py-2 rounded-lg bg-[var(--bg)]">
          <p className="text-[10px] text-[var(--muted)] leading-snug">
            Not legal advice. Not court replacement. Not escrow.
          </p>
        </div>
      </div>
    </aside>
  );
}
