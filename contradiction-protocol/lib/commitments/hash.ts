import { keccak256 } from 'js-sha3';
import { normaliseAssumption } from './normalise';

function keccak(text: string): string {
  return '0x' + keccak256(text);
}

export function createAssumptionCommitment(text: string, salt: string): string {
  const normalised = normaliseAssumption(text);
  return keccak(normalised + salt);
}

export function createAssumptionsRoot(commitments: string[]): string {
  if (commitments.length === 0) return '0x' + '0'.repeat(64);
  return keccak(commitments.join(''));
}

export function createAgreementRoot(
  summary: string,
  creator: string,
  counterparty: string,
  assumptionsRoot: string
): string {
  return keccak(summary + creator.toLowerCase() + counterparty.toLowerCase() + assumptionsRoot);
}

export function verifyCommitment(text: string, salt: string, commitment: string): boolean {
  try {
    const computed = createAssumptionCommitment(text, salt);
    return computed.toLowerCase() === commitment.toLowerCase();
  } catch {
    return false;
  }
}
