# Contradiction Protocol

> Private agreements. Selective reveals. GenLayer AI-consensus interpretation.

## What Is Contradiction Protocol

Contradiction Protocol is a GenLayer-native selective disclosure dApp for private assumption-based agreements.

It lets parties commit to hidden assumptions inside private agreements, then reveal only the affected clause if reality changes — and ask GenLayer to decide what should happen next.

This is **not normal escrow**. Escrow asks: "who gets the money?"
Contradiction Protocol asks: **"did reality break the assumptions that made the agreement fair?"**

## What Problem It Solves

Traditional smart contracts handle deterministic rules: deadline passed, amount paid, signature exists.

They are weak at interpretation:
- Was this hidden assumption genuinely part of the original agreement?
- Did the real-world condition materially change?
- Is that change enough to contradict the agreement's intent?
- Should the parties continue, pause, renegotiate, or settle?

Contradiction Protocol uses GenLayer Intelligent Contracts to perform AI-validator consensus on these qualitative questions.

## Why GenLayer Is Needed

GenLayer Intelligent Contracts can process complex qualitative criteria, interpret human-readable inputs, integrate external web data, and reach AI-validator consensus — without relying on traditional oracle layers.

This is the correct fit for agreement interpretation that depends on meaning, context, and evidence — not just on-chain state.

## What Is Private

Private (stored only in local browser vault):
- Full assumption text
- Assumption salts
- Normalised assumption text
- Draft evidence notes
- Private negotiation notes

## What Is Public (On GenLayer)

Public:
- Agreement summary
- Creator and counterparty addresses
- Agreement root hash
- Assumptions root hash
- Individual assumption commitment hashes
- Reveal records (assumption text + salt + evidence — only after reveal)
- Review verdicts

## How Commitment and Reveal Works

### Creation

For each private assumption:

```
normalisedText = normalise(assumptionText)
salt = generateSalt()
commitment = keccak256(normalisedText + salt)
assumptionsRoot = merkleRoot(commitments)
agreementRoot = hash(summary + parties + assumptionsRoot)
```

Only commitments and roots go on-chain. Full text stays local.

### Reveal

When reality changes:

```
normalisedReveal = normalise(revealedText)
computedCommitment = keccak256(normalisedReveal + salt)
assert computedCommitment === originalCommitment
```

Only the affected assumption, its salt, and evidence are submitted. All other assumptions remain private.

## How Evidence Review Works

Evidence is packaged as a JSON payload:
- URL references
- Text statements
- Official notices
- Document hashes

The evidence is submitted along with the revealed assumption to GenLayer, which reviews:

1. Did the revealed assumption match the original commitment?
2. What did the assumption actually rely on?
3. Did the real-world condition change?
4. Does the evidence support the change?
5. Does the change contradict the original assumption?
6. Is the contradiction material?
7. What action should follow?

## What GenLayer Judges

GenLayer does not simply store agreements. It interprets contradiction claims based on revealed assumptions and evidence.

The structured verdict includes:

```json
{
  "revealedClauseBelongs": true,
  "conditionChanged": true,
  "contradictionFound": true,
  "materiality": "HIGH",
  "evidenceQuality": "STRONG",
  "recommendedAction": "RENEGOTIATE",
  "reasoning": "...",
  "followUpQuestions": [],
  "safetyCaveat": "This is an AI-consensus interpretation, not legal advice."
}
```

Possible recommended actions: `CONTINUE`, `PAUSE`, `RENEGOTIATE`, `SETTLE_PARTIAL`, `SETTLE_FULL`, `REJECT_CLAIM`, `INSUFFICIENT_EVIDENCE`.

## What The App Does Not Do

- Not legal advice
- Not a court replacement
- Not normal escrow
- Not an arbitration guarantee
- Not a token or DeFi product
- Does not move funds automatically
- Does not publish private assumptions without reveal

## Setup

### Prerequisites

- Node.js 20+
- MetaMask or injected browser wallet
- GenLayer Studionet access

### Install

```bash
npm install
```

### Environment

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_GENLAYER_RPC_URL=http://localhost:4000/api
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
```

### Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GenLayer Studionet Configuration

1. Install GenLayer CLI or Studio
2. Deploy `contracts/ContradictionProtocol.py`
3. Copy the deployed contract address to `.env.local`
4. Set your wallet to GenLayer Studionet (Chain ID: 761)

## Wallet Connection

Contradiction Protocol uses injected wallet authentication only.

- Connect MetaMask or any injected provider
- No email/password
- No embedded wallet
- No WalletConnect required (MVP)

## Demo Walkthrough

1. Open landing page at `/`
2. Click "Enter Protocol"
3. Connect injected wallet
4. Click "New Agreement"
5. Enter counterparty address and agreement title
6. Write agreement summary (public)
7. Add 2-3 private assumptions with trigger conditions
8. Preview commitment hashes
9. Sign and commit agreement to GenLayer
10. Open agreement detail
11. Click "Reveal Assumption"
12. Select the affected assumption from local vault
13. Add URL/text evidence of the changed condition
14. Preview what will be revealed vs what stays private
15. Sign and submit the reveal
16. Open the Review Room
17. Click "Run Contradiction Review"
18. Watch GenLayer validators interpret the claim
19. See the structured verdict
20. Open Consensus Playground for a full demo trace

## Known Limitations

- GenLayer Studionet requires local setup or access to Studionet endpoint
- Commitment hashing uses keccak256 on the frontend and sha256 in the Python contract for demo purposes; production should align on keccak256 throughout
- Local vault uses IndexedDB and is browser-specific — export a backup before clearing browser data
- File upload evidence is planned for a future phase
- Counterparty notification is manual in this MVP
- Fund movement is not implemented; this is an interpretation layer only
