export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const CONTRACT_ABI = [
  {
    name: 'create_agreement',
    type: 'function',
    inputs: [
      { name: 'counterparty', type: 'address' },
      { name: 'agreement_summary', type: 'string' },
      { name: 'agreement_root', type: 'string' },
      { name: 'assumptions_root', type: 'string' },
      { name: 'assumption_commitments_json', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'activate_agreement',
    type: 'function',
    inputs: [{ name: 'agreement_id', type: 'string' }],
    outputs: [],
  },
  {
    name: 'submit_reveal',
    type: 'function',
    inputs: [
      { name: 'agreement_id', type: 'string' },
      { name: 'commitment', type: 'string' },
      { name: 'revealed_assumption', type: 'string' },
      { name: 'salt', type: 'string' },
      { name: 'evidence_json', type: 'string' },
      { name: 'requested_action', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'review_contradiction',
    type: 'function',
    inputs: [{ name: 'reveal_id', type: 'string' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'respond_to_reveal',
    type: 'function',
    inputs: [
      { name: 'reveal_id', type: 'string' },
      { name: 'response_json', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'finalise_resolution',
    type: 'function',
    inputs: [{ name: 'reveal_id', type: 'string' }],
    outputs: [],
  },
  {
    name: 'get_agreement',
    type: 'function',
    inputs: [{ name: 'agreement_id', type: 'string' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    name: 'get_reveal',
    type: 'function',
    inputs: [{ name: 'reveal_id', type: 'string' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    name: 'get_review',
    type: 'function',
    inputs: [{ name: 'review_id', type: 'string' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    name: 'get_user_agreements',
    type: 'function',
    inputs: [{ name: 'user_address', type: 'address' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    name: 'get_protocol_stats',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;
