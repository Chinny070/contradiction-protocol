import { STUDIONET } from './network';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || '';

interface TxResult {
  hash: string;
  status: 'pending' | 'success' | 'error';
  data?: string;
  error?: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export async function getAccount(): Promise<string | null> {
  if (!window.ethereum) return null;
  try {
    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts',
    })) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function getCurrentChainId(): Promise<number | null> {
  if (!window.ethereum) return null;
  try {
    const chainId = (await window.ethereum.request({
      method: 'eth_chainId',
    })) as string;
    return parseInt(chainId, 16);
  } catch {
    return null;
  }
}

export async function switchToStudioNet(): Promise<boolean> {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET.chainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number };
    if (err.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: STUDIONET.chainIdHex,
              chainName: STUDIONET.chainName,
              nativeCurrency: STUDIONET.nativeCurrency,
              rpcUrls: STUDIONET.rpcUrls,
              blockExplorerUrls: STUDIONET.blockExplorerUrls,
            },
          ],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}


function encodeFunctionCall(methodName: string, args: string[]): string {
  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(methodName);
  const hashHex = Array.from(msgBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const jsonArgs = JSON.stringify(args);
  const argsHex = Buffer.from(jsonArgs, 'utf-8').toString('hex');

  return '0x' + hashHex + argsHex;
}

export async function callWriteMethod(
  method: string,
  args: string[]
): Promise<TxResult> {
  if (!window.ethereum) throw new Error('No wallet found');
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured');

  const account = await getAccount();
  if (!account) throw new Error('No account connected');

  const chainId = await getCurrentChainId();
  if (chainId !== STUDIONET.chainId) {
    const switched = await switchToStudioNet();
    if (!switched) throw new Error('Failed to switch to StudioNet');
  }

  try {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [
        {
          from: account,
          to: CONTRACT_ADDRESS,
          data: encodeFunctionCall(method, args),
        },
      ],
      id: Date.now(),
    });

    const response = await fetch(STUDIONET.rpcUrls[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    const result = await response.json();

    if (result.error) {
      return { hash: '', status: 'error', error: result.error.message };
    }

    return { hash: result.result || '', status: 'pending' };
  } catch (err: unknown) {
    const error = err as Error;
    return { hash: '', status: 'error', error: error.message };
  }
}

export async function callReadMethod(
  method: string,
  args: string[]
): Promise<string> {
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured');

  try {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      method: 'gen_call',
      params: [
        {
          to: CONTRACT_ADDRESS,
          data: encodeFunctionCall(method, args),
        },
        'latest',
      ],
      id: Date.now(),
    });

    const response = await fetch(STUDIONET.rpcUrls[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || 'RPC error');
    }

    return result.result || '';
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(`Read call failed: ${error.message}`);
  }
}

export async function sendTransaction(
  method: string,
  args: string[]
): Promise<TxResult> {
  if (!window.ethereum) throw new Error('No wallet found');
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured');

  const account = await getAccount();
  if (!account) throw new Error('No account connected');

  const chainId = await getCurrentChainId();
  if (chainId !== STUDIONET.chainId) {
    const switched = await switchToStudioNet();
    if (!switched) throw new Error('Failed to switch to StudioNet');
  }

  try {
    const data = encodeFunctionCall(method, args);
    const hash = (await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: account,
          to: CONTRACT_ADDRESS,
          data,
        },
      ],
    })) as string;

    return { hash, status: 'pending' };
  } catch (err: unknown) {
    const error = err as Error;
    return { hash: '', status: 'error', error: error.message };
  }
}

export async function waitForReceipt(
  txHash: string,
  maxAttempts = 30,
  intervalMs = 3000
): Promise<{ status: 'success' | 'error'; data?: unknown }> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionReceipt',
        params: [txHash],
        id: Date.now(),
      });

      const response = await fetch(STUDIONET.rpcUrls[0], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });

      const result = await response.json();

      if (result.result) {
        const receipt = result.result;
        if (receipt.status === '0x1' || receipt.status === '0x01') {
          return { status: 'success', data: receipt };
        }
        if (receipt.status === '0x0' || receipt.status === '0x00') {
          return { status: 'error', data: receipt };
        }
      }
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return { status: 'error' };
}
