'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAllAssumptions, exportVault, importVault, clearVault } from '@/lib/vault/localVault';
import { fromNow } from '@/lib/utils/dates';
import { Shield, Download, Upload, Trash2, Lock, Copy, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import type { PrivateAssumption } from '@/types';

export default function VaultPage() {
  const [assumptions, setAssumptions] = useState<PrivateAssumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  async function load() {
    setLoading(true);
    const all = await getAllAssumptions();
    setAssumptions(all);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleExport() {
    const json = await exportVault();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contradiction-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      await importVault(text);
      load();
    };
    input.click();
  }

  async function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    await clearVault();
    setAssumptions([]);
    setConfirmClear(false);
  }

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto slide-up space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-space), sans-serif' }}>
            Local Assumption Vault
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Private assumptions stored in your browser. Never sent to any server.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleImport}>
            <Upload className="w-3.5 h-3.5" />
            Import
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={assumptions.length === 0}>
            <Download className="w-3.5 h-3.5" />
            Export Backup
          </Button>
        </div>
      </div>

      {/* Warning */}
      <Card className="p-4 border-[var(--verdict-gold)] border">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--verdict-gold)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Backup your vault</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              If you delete your local vault without a backup, unrevealed assumption salts may be lost.
              Without the salt, you cannot prove a commitment match and cannot submit a reveal.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">{assumptions.length}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Total Assumptions</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-[var(--text)]">
            {new Set(assumptions.map(a => a.agreementId)).size}
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Agreements</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-[var(--primary)]">
            <Shield className="w-6 h-6 mx-auto" />
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Browser-only storage</div>
        </Card>
      </div>

      {/* Assumptions list */}
      {loading ? (
        <div className="py-12 text-center text-[var(--muted)] text-sm">Loading vault…</div>
      ) : assumptions.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-12 h-12" />}
          title="Vault is empty"
          description="Private assumptions will appear here after you create an agreement."
        />
      ) : (
        <div className="space-y-3">
          {assumptions.map(a => (
            <Card key={a.localId} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <h3 className="text-sm font-semibold">{a.title}</h3>
                    <Badge variant="muted">{a.category}</Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed mb-2">{a.normalisedText}</p>
                  <div className="space-y-1">
                    <div>
                      <span className="text-[10px] text-[var(--muted)] font-mono">commitment: </span>
                      <span className="hash-text">{a.commitment}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)] font-mono">agreement: </span>
                      <span className="hash-text text-[10px]">{a.agreementId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Link href={`/app/agreements/${a.agreementId}`}>
                    <Button variant="secondary" size="sm" title="Open Agreement">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Agreement
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(a.commitment, a.localId + '-c')}
                  >
                    {copied === a.localId + '-c'
                      ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      : <Copy className="w-3.5 h-3.5" />
                    }
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Danger zone */}
      {assumptions.length > 0 && (
        <Card className="p-4 border-[var(--danger)] border">
          <h3 className="text-sm font-semibold text-[var(--danger)] mb-2">Danger Zone</h3>
          <p className="text-xs text-[var(--muted)] mb-3">
            Clearing your vault permanently removes all assumption salts from this browser.
            This cannot be undone unless you have an exported backup.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClear}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmClear ? 'Click again to confirm deletion' : 'Clear Vault'}
          </Button>
        </Card>
      )}
    </div>
  );
}
