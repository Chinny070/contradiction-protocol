import type { CaseRecord, EvidenceRecord, CanonicalVerdict } from '../genlayer/types';

export const DEMO_CASE: CaseRecord = {
  case_id: 'CASE-0001',
  creator: '0xdemo000000000000000000000000000000000001',
  title: 'Login and Dashboard Scope Dispute',
  agreement_summary:
    'Party A says the agreement included login and landing page only. Party B says dashboard analytics were also included.',
  party_a: 'Developer (Party A)',
  party_b: 'Client (Party B)',
  status: 'VERDICT_ISSUED',
  evidence_count: 4,
  created_at_note: '2025-06-01',
  final_verdict_json: JSON.stringify({
    verdict: 'PARTIAL_AGREEMENT',
    agreement_state: 'PARTIALLY_CONFIRMED',
    confirmed_terms: ['Login functionality required', 'Landing page included in scope'],
    excluded_terms: ['Dashboard analytics not included in first scope'],
    changed_terms: [],
    ambiguous_terms: ['Admin panel design depth unclear'],
    prevailing_party: 'party_a',
    confidence: 'HIGH',
    decisive_evidence_ids: ['EV-0001', 'EV-0002', 'EV-0004'],
    short_reason:
      'Later messages consistently confirm login and landing page as agreed scope. Dashboard was explicitly deferred. Party B\'s later claim is unsupported by evidence.',
  }),
  appeal_count: 0,
};

export const DEMO_EVIDENCE: EvidenceRecord[] = [
  {
    evidence_id: 'EV-0001',
    case_id: 'CASE-0001',
    submitter: '0xdemo000000000000000000000000000000000001',
    evidence_type: 'CHAT_LOG',
    title: 'Initial scope message from Party A',
    content_ref: '',
    excerpt:
      'I can do login and basic landing page for this round. Dashboard is not part of this first scope.',
    claim: 'Dashboard excluded from agreed scope.',
    submitted_at_note: '2025-06-01',
  },
  {
    evidence_id: 'EV-0002',
    case_id: 'CASE-0001',
    submitter: '0xdemo000000000000000000000000000000000002',
    evidence_type: 'CHAT_LOG',
    title: 'Party B reply accepting login first',
    content_ref: '',
    excerpt: 'Okay login first is fine. We can discuss dashboard after demo.',
    claim: 'Login first was accepted by Party B.',
    submitted_at_note: '2025-06-02',
  },
  {
    evidence_id: 'EV-0003',
    case_id: 'CASE-0001',
    submitter: '0xdemo000000000000000000000000000000000002',
    evidence_type: 'TEXT',
    title: 'Party B later claim about dashboard',
    content_ref: '',
    excerpt: 'You promised dashboard analytics too.',
    claim: 'Dashboard analytics were part of the agreement.',
    submitted_at_note: '2025-06-10',
  },
  {
    evidence_id: 'EV-0004',
    case_id: 'CASE-0001',
    submitter: '0xdemo000000000000000000000000000000000001',
    evidence_type: 'GITHUB_COMMIT',
    title: 'Commit showing implemented scope',
    content_ref: 'https://github.com/example/repo/commit/abc123',
    excerpt: 'add email login flow and landing page CTA',
    claim: 'Only login and landing page were implemented as agreed.',
    submitted_at_note: '2025-06-12',
  },
];

export const DEMO_VERDICT: CanonicalVerdict = JSON.parse(DEMO_CASE.final_verdict_json);
