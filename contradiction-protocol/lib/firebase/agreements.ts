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

export type AgreementRecord = {
  id: string;
  title: string;
  creator: string;
  counterparty: string;
  agreementSummary: string;
  agreementRoot: string;
  assumptionsRoot: string;
  assumptionCount: number;
  status: string;
  createdAt: number;
  commitments: string[];
};

const COL = 'agreements';

export async function saveAgreement(record: AgreementRecord): Promise<void> {
  await setDoc(doc(db, COL, record.id), {
    ...record,
    _createdAt: serverTimestamp(),
  });
}

export async function getAgreement(id: string): Promise<AgreementRecord | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, id: snap.id } as AgreementRecord;
}

export async function getAgreementsForAddress(address: string): Promise<AgreementRecord[]> {
  const asCreator = query(
    collection(db, COL),
    where('creator', '==', address),
    orderBy('createdAt', 'desc')
  );
  const asCounterparty = query(
    collection(db, COL),
    where('counterparty', '==', address),
    orderBy('createdAt', 'desc')
  );

  const [creatorSnap, counterpartySnap] = await Promise.all([
    getDocs(asCreator),
    getDocs(asCounterparty),
  ]);

  const seen = new Set<string>();
  const results: AgreementRecord[] = [];

  for (const snap of [...creatorSnap.docs, ...counterpartySnap.docs]) {
    if (!seen.has(snap.id)) {
      seen.add(snap.id);
      results.push({ ...snap.data(), id: snap.id } as AgreementRecord);
    }
  }

  return results.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllAgreements(): Promise<AgreementRecord[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')));
  return snap.docs.map((d: QueryDocumentSnapshot) => ({ ...d.data(), id: d.id } as AgreementRecord));
}

export async function updateAgreementStatus(id: string, status: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { status });
}
