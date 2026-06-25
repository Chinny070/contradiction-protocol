export type CaseStatus =
  | 'OPEN'
  | 'EVIDENCE_SUBMITTED'
  | 'REVIEW_PENDING'
  | 'VERDICT_ISSUED'
  | 'APPEALED'
  | 'APPEAL_RESOLVED';

export type EvidenceType =
  | 'TEXT'
  | 'SCREENSHOT_URL'
  | 'PDF_URL'
  | 'CHAT_LOG'
  | 'EMAIL_EXCERPT'
  | 'GITHUB_COMMIT'
  | 'VIDEO_URL'
  | 'OTHER_URL';

export type VerdictType =
  | 'AGREEMENT_VERIFIED'
  | 'PARTIAL_AGREEMENT'
  | 'NO_AGREEMENT_FOUND'
  | 'AGREEMENT_CHANGED'
  | 'CONFLICT_UNRESOLVED'
  | 'INSUFFICIENT_EVIDENCE';

export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';

export type AgreementState =
  | 'FULLY_CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'CHANGED'
  | 'UNCLEAR'
  | 'NOT_FOUND';

export type AppealBasis =
  | 'NEW_EVIDENCE'
  | 'WRONG_INTERPRETATION'
  | 'MISSING_CONTRADICTION'
  | 'FORGED_EVIDENCE'
  | 'TIMELINE_MISREAD'
  | 'SCOPE_CHANGE_IGNORED';

export interface CaseRecord {
  case_id: string;
  creator: string;
  title: string;
  agreement_summary: string;
  party_a: string;
  party_b: string;
  status: CaseStatus;
  evidence_count: number;
  created_at_note: string;
  final_verdict_json: string;
  appeal_count: number;
}

export interface EvidenceRecord {
  evidence_id: string;
  case_id: string;
  submitter: string;
  evidence_type: EvidenceType;
  title: string;
  content_ref: string;
  excerpt: string;
  claim: string;
  submitted_at_note: string;
}

export interface AppealRecord {
  appeal_id: string;
  case_id: string;
  appellant: string;
  basis: AppealBasis;
  argument: string;
  new_evidence_ref: string;
  status: string;
  result_json: string;
}

export interface CanonicalVerdict {
  verdict: VerdictType;
  agreement_state: AgreementState;
  confirmed_terms: string[];
  excluded_terms: string[];
  changed_terms: string[];
  ambiguous_terms: string[];
  prevailing_party: 'party_a' | 'party_b' | 'mixed' | 'none';
  confidence: Confidence;
  decisive_evidence_ids: string[];
  short_reason: string;
}
