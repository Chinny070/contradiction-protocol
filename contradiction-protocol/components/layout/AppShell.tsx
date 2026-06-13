'use client';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
