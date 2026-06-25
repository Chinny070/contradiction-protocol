import type { CanonicalVerdict, VerdictType, Confidence, AgreementState } from '../genlayer/types';

export function parseVerdict(raw: string): CanonicalVerdict | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.verdict || !parsed.agreement_state) return null;
    return {
      verdict: parsed.verdict as VerdictType,
      agreement_state: parsed.agreement_state as AgreementState,
      confirmed_terms: Array.isArray(parsed.confirmed_terms) ? parsed.confirmed_terms.slice(0, 8) : [],
      excluded_terms: Array.isArray(parsed.excluded_terms) ? parsed.excluded_terms.slice(0, 8) : [],
      changed_terms: Array.isArray(parsed.changed_terms) ? parsed.changed_terms.slice(0, 8) : [],
      ambiguous_terms: Array.isArray(parsed.ambiguous_terms) ? parsed.ambiguous_terms.slice(0, 8) : [],
      prevailing_party: parsed.prevailing_party || 'none',
      confidence: (parsed.confidence as Confidence) || 'LOW',
      decisive_evidence_ids: Array.isArray(parsed.decisive_evidence_ids) ? parsed.decisive_evidence_ids.slice(0, 8) : [],
      short_reason: typeof parsed.short_reason === 'string' ? parsed.short_reason.slice(0, 240) : '',
    };
  } catch {
    return null;
  }
}

export function verdictLabel(verdict: VerdictType): string {
  const labels: Record<VerdictType, string> = {
    AGREEMENT_VERIFIED: 'Agreement Verified',
    PARTIAL_AGREEMENT: 'Partial Agreement',
    NO_AGREEMENT_FOUND: 'No Agreement Found',
    AGREEMENT_CHANGED: 'Agreement Changed',
    CONFLICT_UNRESOLVED: 'Conflict Unresolved',
    INSUFFICIENT_EVIDENCE: 'Insufficient Evidence',
  };
  return labels[verdict] || verdict;
}

export function confidenceColor(confidence: Confidence): string {
  switch (confidence) {
    case 'HIGH': return 'var(--rl-green)';
    case 'MEDIUM': return 'var(--rl-amber)';
    case 'LOW': return 'var(--rl-red)';
  }
}

export function stateColor(state: AgreementState): string {
  switch (state) {
    case 'FULLY_CONFIRMED': return 'var(--rl-green)';
    case 'PARTIALLY_CONFIRMED': return 'var(--rl-amber)';
    case 'CHANGED': return 'var(--rl-cyan)';
    case 'UNCLEAR': return 'var(--rl-red)';
    case 'NOT_FOUND': return 'var(--rl-muted)';
  }
}
