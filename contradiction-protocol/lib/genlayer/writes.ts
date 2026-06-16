import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { CONTRACT_ADDRESS } from './contract';

type EthProvider = NonNullable<NonNullable<Parameters<typeof createClient>[0]>['provider']>;

const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

async function getClient() {
  if (typeof window === 'undefined') return null;
  if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.length !== 42) return null;
  const provider = (window as unknown as { ethereum?: EthProvider }).ethereum;
  if (!provider) return null;

  // Request accounts from MetaMask — triggers the popup if not yet connected
  const accounts: string[] = await provider.request({ method: 'eth_requestAccounts', params: [] });
  if (!accounts?.length) return null;

  return createClient({
    chain: studionet,
    endpoint: RPC,
    account: accounts[0] as `0x${string}`,
    provider,
  });
}

async function write(functionName: string, args: unknown[]): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS! as `0x${string}`,
      functionName,
      args: args as Parameters<typeof client.writeContract>[0]['args'],
      value: BigInt(0),
    });
    return hash as string;
  } catch (e) {
    console.warn(`GenLayer ${functionName} failed:`, e);
    return null;
  }
}

export async function glCreateAgreement(params: {
  counterparty: string;
  agreementSummary: string;
  agreementRoot: string;
  assumptionsRoot: string;
  commitments: string[];
}): Promise<string | null> {
  return write('create_agreement', [
    params.counterparty,
    params.agreementSummary,
    params.agreementRoot,
    params.assumptionsRoot,
    JSON.stringify(params.commitments),
  ]);
}

export async function glSubmitReveal(params: {
  agreementId: string;
  commitment: string;
  revealedAssumption: string;
  salt: string;
  evidence: object[];
  requestedAction: string;
}): Promise<string | null> {
  return write('submit_reveal', [
    params.agreementId,
    params.commitment,
    params.revealedAssumption,
    params.salt,
    JSON.stringify(params.evidence),
    params.requestedAction,
  ]);
}

export async function glReviewContradiction(revealId: string): Promise<string | null> {
  return write('review_contradiction', [revealId]);
}

export async function glRespondToReveal(params: {
  revealId: string;
  response: object;
}): Promise<string | null> {
  return write('respond_to_reveal', [params.revealId, JSON.stringify(params.response)]);
}

export async function glFinaliseResolution(revealId: string): Promise<string | null> {
  return write('finalise_resolution', [revealId]);
}
