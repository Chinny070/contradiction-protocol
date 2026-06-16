import { createConfig, createStorage, http, noopStorage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { genlayerStudionet } from '@/lib/genlayer/chains';

export const wagmiConfig = createConfig({
  chains: [genlayerStudionet],
  connectors: [injected()],
  // noopStorage prevents wagmi from persisting the connection across refreshes
  storage: createStorage({ storage: noopStorage }),
  transports: {
    [genlayerStudionet.id]: http(
      process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || 'http://localhost:4000/api'
    ),
  },
});
