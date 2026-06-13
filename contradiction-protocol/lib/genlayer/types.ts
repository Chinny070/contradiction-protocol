export type GenLayerAgreementRecord = {
  id: string;
  creator: string;
  counterparty: string;
  summary: string;
  agreement_root: string;
  assumptions_root: string;
  commitments_json: string;
  status: string;
  created_at: string;
};

export type GenLayerRevealRecord = {
  id: string;
  agreement_id: string;
  commitment: string;
  revealed_assumption: string;
  salt_hash: string;
  evidence_json: string;
  requested_action: string;
  status: string;
  created_by: string;
  created_at: string;
};

export type GenLayerReviewRecord = {
  id: string;
  reveal_id: string;
  verdict_json: string;
  recommended_action: string;
  materiality: string;
  evidence_quality: string;
  created_at: string;
};

export type ProtocolStats = {
  total_agreements: number;
  active_agreements: number;
  total_reveals: number;
  total_reviews: number;
};
