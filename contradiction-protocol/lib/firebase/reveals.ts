import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import type { ContradictionVerdict } from '@/types';

export type CounterpartyResponse = {
  statement: string;
  agrees: boolean;
  counterEvidence: { title: string; type: string; url: string; summary: string }[];
  submittedBy: string;
  submittedAt: number;
};

export type RevealRecord = {
  id: string;
  agreementId: string;
  assumptionCommitment: string;
  revealedAssumptionText: string;
  salt: string;
  requestedAction: string;
  status: string;
  createdBy: string;
  createdAt: number;
  evidence: { title: string; type: string; url: string; summary: string }[];
  verdictJson: ContradictionVerdict | null;
  counterpartyResponse?: CounterpartyResponse | null;
  glTxHash?: string | null;
};

const COL = 'reveals';

export async function saveReveal(record: RevealRecord): Promise<void> {
  await setDoc(doc(db, COL, record.id), {
    ...record,
    _createdAt: serverTimestamp(),
  });
}

export async function getReveal(id: string): Promise<RevealRecord | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as RevealRecord;
}

export async function getRevealsForAgreement(agreementId: string): Promise<RevealRecord[]> {
  const snap = await getDocs(
    query(collection(db, COL), where('agreementId', '==', agreementId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ ...d.data(), id: d.id } as RevealRecord));
}

export async function getAllReveals(): Promise<RevealRecord[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')));
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ ...d.data(), id: d.id } as RevealRecord));
}

export async function updateRevealVerdict(
  id: string,
  verdictJson: ContradictionVerdict,
  status: string
): Promise<void> {
  await updateDoc(doc(db, COL, id), { verdictJson, status });
}

export async function updateRevealResponse(
  id: string,
  response: CounterpartyResponse
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    counterpartyResponse: response,
    status: 'UNDER_REVIEW',
  });
}

export async function updateRevealTxHash(id: string, glTxHash: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { glTxHash });
}
