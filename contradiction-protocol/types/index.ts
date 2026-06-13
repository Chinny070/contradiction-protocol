export type AgreementStatus =
  | 'DRAFT'
  | 'COMMITTED'
  | 'ACTIVE'
  | 'CHALLENGED'
  | 'PAUSED'
  | 'RENEGOTIATION_REQUESTED'
  | 'SETTLED'
  | 'CLOSED';

export type Agreement = {
  id: string;
  title: string;
  creator: `0x${string}`;
  counterparty: `0x${string}`;
  agreementSummary: string;
  agreementRoot: string;
  assumptionsRoot: string;
  assumptionCount: number;
  status: AgreementStatus;
  createdAt: number;
  activatedAt?: number;
  closedAt?: number;
};

export type AssumptionCategory =
  | 'MARKET_PRICE'
  | 'REGULATION'
  | 'DELIVERY_CONDITION'
  | 'ACCESS_CONDITION'
  | 'CERTIFICATION'
  | 'SUPPLIER_CAPACITY'
  | 'PAYMENT_CONDITION'
  | 'WEATHER_OR_FORCE_MAJEURE'
  | 'OTHER';

export type ResolutionAction =
  | 'CONTINUE'
  | 'PAUSE'
  | 'RENEGOTIATE'
  | 'SETTLE_PARTIAL'
  | 'SETTLE_FULL'
  | 'REJECT_CLAIM'
  | 'INSUFFICIENT_EVIDENCE';

export type PrivateAssumption = {
  localId: string;
  agreementId: string;
  title: string;
  category: AssumptionCategory;
  normalisedText: string;
  triggerCondition: string;
  expectedState: string;
  contradictionTest: string;
  materialityThreshold: string;
  preferredRemedy: ResolutionAction;
  salt: string;
  commitment: string;
  encryptedBlob?: string;
};

export type RevealStatus =
  | 'SUBMITTED'
  | 'COMMITMENT_VERIFIED'
  | 'UNDER_REVIEW'
  | 'DECIDED'
  | 'REJECTED';

export type AssumptionReveal = {
  id: string;
  agreementId: string;
  assumptionCommitment: string;
  revealedAssumptionText: string;
  salt: string;
  evidenceIds: string[];
  requestedAction: ResolutionAction;
  status: RevealStatus;
  createdBy: `0x${string}`;
  createdAt: number;
};

export type EvidenceType =
  | 'URL'
  | 'DOCUMENT_HASH'
  | 'TEXT_STATEMENT'
  | 'SCREENSHOT_HASH'
  | 'OFFICIAL_NOTICE'
  | 'COUNTERPARTY_RESPONSE'
  | 'WEB_REFERENCE';

export type EvidenceItem = {
  id: string;
  revealId: string;
  type: EvidenceType;
  title: string;
  source: string;
  url?: string;
  contentHash?: string;
  summary: string;
  submittedBy: `0x${string}`;
  createdAt: number;
};

export type ContradictionVerdict = {
  revealedClauseBelongs: boolean;
  conditionChanged: boolean;
  contradictionFound: boolean;
  materiality: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceQuality: 'WEAK' | 'MODERATE' | 'STRONG';
  recommendedAction: ResolutionAction;
  reasoning: string;
  followUpQuestions: string[];
  safetyCaveat: string;
};

export type ReviewRecord = {
  id: string;
  revealId: string;
  verdict: ContradictionVerdict;
  createdAt: number;
};
