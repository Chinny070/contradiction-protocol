'use client';
import { get, set, del, keys } from 'idb-keyval';
import type { PrivateAssumption, Agreement } from '@/types';

const VAULT_PREFIX = 'cp:assumption:';
const DRAFT_PREFIX = 'cp:draft:';

export async function saveAssumption(assumption: PrivateAssumption): Promise<void> {
  await set(`${VAULT_PREFIX}${assumption.localId}`, assumption);
}

export async function getAssumption(localId: string): Promise<PrivateAssumption | undefined> {
  return get(`${VAULT_PREFIX}${localId}`);
}

export async function getAssumptionsForAgreement(agreementId: string): Promise<PrivateAssumption[]> {
  const allKeys = await keys();
  const vaultKeys = allKeys.filter(k => String(k).startsWith(VAULT_PREFIX));
  const all = await Promise.all(vaultKeys.map(k => get<PrivateAssumption>(k)));
  return all.filter((a): a is PrivateAssumption => !!a && a.agreementId === agreementId);
}

export async function getAllAssumptions(): Promise<PrivateAssumption[]> {
  const allKeys = await keys();
  const vaultKeys = allKeys.filter(k => String(k).startsWith(VAULT_PREFIX));
  const all = await Promise.all(vaultKeys.map(k => get<PrivateAssumption>(k)));
  return all.filter((a): a is PrivateAssumption => !!a);
}

export async function deleteAssumption(localId: string): Promise<void> {
  await del(`${VAULT_PREFIX}${localId}`);
}

export async function saveDraftAgreement(draft: Partial<Agreement> & { assumptions?: PrivateAssumption[] }): Promise<void> {
  await set(`${DRAFT_PREFIX}${draft.id || 'current'}`, draft);
}

export async function getDraftAgreement(id = 'current') {
  return get(`${DRAFT_PREFIX}${id}`);
}

export async function exportVault(): Promise<string> {
  const assumptions = await getAllAssumptions();
  return JSON.stringify({ version: 1, exportedAt: Date.now(), assumptions }, null, 2);
}

export async function importVault(json: string): Promise<number> {
  const data = JSON.parse(json);
  const assumptions: PrivateAssumption[] = data.assumptions || [];
  await Promise.all(assumptions.map(a => saveAssumption(a)));
  return assumptions.length;
}

export async function clearVault(): Promise<void> {
  const allKeys = await keys();
  const vaultKeys = allKeys.filter(k => String(k).startsWith(VAULT_PREFIX));
  await Promise.all(vaultKeys.map(k => del(k)));
}
