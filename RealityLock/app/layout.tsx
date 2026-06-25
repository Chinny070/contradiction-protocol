import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RealityLock — Canonical Agreement Engine',
  description: 'Lock what was actually agreed. GenLayer-powered canonical agreement resolution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen" style={{ background: 'var(--rl-bg)' }}>
        {children}
      </body>
    </html>
  );
}
