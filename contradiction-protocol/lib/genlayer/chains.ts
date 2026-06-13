import type { Chain } from 'viem';

export const genlayerStudionet: Chain = {
  id: 761,
  name: 'GenLayer Studionet',
  nativeCurrency: { name: 'GL', symbol: 'GL', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'http://localhost:4000/api'],
    },
  },
};
