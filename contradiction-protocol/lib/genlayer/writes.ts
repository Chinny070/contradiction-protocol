import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { CONTRACT_ADDRESS } from './contract';

type EthProvider = NonNullable<NonNullable<Parameters<typeof createClient>[0]>['provider']>;

const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'https://studio.genlayer.com/api';

async function getClient() {
  if (typeof window === 'undefined') {
    console.error('[GenLayer] Cannot run server-side');
    return null;
  }
  if (!CONTRACT_ADDRESS) {
    console.error('[GenLayer] CONTRACT_ADDRESS not set — check NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS env var');
    return null;
  }
  if (CONTRACT_ADDRESS.length !== 42) {
    console.error('[GenLayer] CONTRACT_ADDRESS invalid length:', CONTRACT_ADDRESS.length, CONTRACT_ADDRESS);
    return null;
  }
  const provider = (window as unknown as { ethereum?: EthProvider }).ethereum;
  if (!provider) {
    console.error('[GenLayer] No window.ethereum — is MetaMask installed?');
    return null;
  }

  console.log('[GenLayer] Requesting accounts from MetaMask...');
  const accounts: string[] = await provider.request({ method: 'eth_requestAccounts', params: [] });
  if (!accounts?.length) {
    console.error('[GenLayer] MetaMask returned no accounts');
    return null;
  }
  console.log('[GenLayer] Using account:', accounts[0], 'RPC:', RPC);

  // Ensure MetaMask is on the correct chain (61999 = GenLayer Studionet)
  const chainIdHex = '0xf22f';
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
  } catch (switchErr: unknown) {
    const err = switchErr as { code?: number };
    // 4902 = chain not added yet — add it
    if (err.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: 'GenLayer Studionet',
          nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
          rpcUrls: [RPC],
          blockExplorerUrls: ['https://genlayer-explorer.vercel.app'],
        }],
      });
    } else {
      console.error('[GenLayer] Failed to switch chain:', switchErr);
      return null;
    }
  }

  return createClient({
    chain: studionet,
    endpoint: RPC,
    account: accounts[0] as `0x${string}`,
    provider,
  });
}

async function write(functionName: string, args: unknown[]): Promise<string | null> {
  console.log(`[GenLayer] writeContract: ${functionName}`, args);
  const client = await getClient();
  if (!client) {
    console.error(`[GenLayer] No client — ${functionName} aborted`);
    return null;
  }
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS! as `0x${string}`,
    functionName,
    args: args as Parameters<typeof client.writeContract>[0]['args'],
    value: BigInt(0),
  });
  console.log(`[GenLayer] ${functionName} tx hash:`, hash);
  return hash as string;
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
