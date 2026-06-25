import { sendTransaction, callReadMethod, waitForReceipt } from './client';
import type {
  CaseRecord,
  EvidenceRecord,
  CanonicalVerdict,
  AppealRecord,
} from './types';

interface WriteResult {
  hash: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export async function createCase(
  caseId: string,
  title: string,
  agreementSummary: string,
  partyA: string,
  partyB: string,
  createdAtNote: string
): Promise<WriteResult> {
  return sendTransaction('create_case', [
    caseId,
    title,
    agreementSummary,
    partyA,
    partyB,
    createdAtNote,
  ]);
}

export async function submitEvidence(
  caseId: string,
  evidenceId: string,
  evidenceType: string,
  title: string,
  contentRef: string,
  excerpt: string,
  claim: string,
  submittedAtNote: string
): Promise<WriteResult> {
  return sendTransaction('submit_evidence', [
    caseId,
    evidenceId,
    evidenceType,
    title,
    contentRef,
    excerpt,
    claim,
    submittedAtNote,
  ]);
}

export async function requestReview(caseId: string): Promise<WriteResult> {
  return sendTransaction('request_review', [caseId]);
}

export async function submitAppeal(
  caseId: string,
  appealId: string,
  basis: string,
  argument: string,
  newEvidenceRef: string
): Promise<WriteResult> {
  return sendTransaction('appeal', [
    caseId,
    appealId,
    basis,
    argument,
    newEvidenceRef,
  ]);
}

export async function getCase(caseId: string): Promise<CaseRecord | null> {
  try {
    const raw = await callReadMethod('get_case', [caseId]);
    return JSON.parse(raw) as CaseRecord;
  } catch {
    return null;
  }
}

export async function getAllCases(): Promise<CaseRecord[]> {
  try {
    const raw = await callReadMethod('get_all_cases', []);
    return JSON.parse(raw) as CaseRecord[];
  } catch {
    return [];
  }
}

export async function getEvidence(
  evidenceId: string
): Promise<EvidenceRecord | null> {
  try {
    const raw = await callReadMethod('get_evidence', [evidenceId]);
    return JSON.parse(raw) as EvidenceRecord;
  } catch {
    return null;
  }
}

export async function getCaseEvidenceIds(caseId: string): Promise<string[]> {
  try {
    const raw = await callReadMethod('get_case_evidence_ids', [caseId]);
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function getVerdict(
  caseId: string
): Promise<CanonicalVerdict | null> {
  try {
    const raw = await callReadMethod('get_verdict', [caseId]);
    if (!raw) return null;
    return JSON.parse(raw) as CanonicalVerdict;
  } catch {
    return null;
  }
}

export async function getCaseAppeals(
  caseId: string
): Promise<AppealRecord[]> {
  try {
    const raw = await callReadMethod('get_case_appeals', [caseId]);
    return JSON.parse(raw) as AppealRecord[];
  } catch {
    return [];
  }
}

export async function waitAndConfirm(hash: string) {
  return waitForReceipt(hash);
}
