# Contradiction Protocol

> Private agreements. Selective reveals. GenLayer AI-consensus interpretation.

**Live:** [contradiction-protocol.vercel.app](https://contradiction-protocol.vercel.app)

## What Is Contradiction Protocol

Contradiction Protocol is a GenLayer-native selective disclosure dApp for private assumption-based agreements.

It lets parties commit to hidden assumptions inside private agreements, then reveal only the affected clause if reality changes — and ask GenLayer to decide what should happen next.

This is **not normal escrow**. Escrow asks: "who gets the money?"
Contradiction Protocol asks: **"did reality break the assumptions that made the agreement fair?"**

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Smart Contract:** GenLayer Intelligent Contract (Python) — deployed on GenLayer Studionet
- **On-chain SDK:** [genlayer-js](https://www.npmjs.com/package/genlayer-js)
- **Wallet:** MetaMask (injected provider, auto-switches to GenLayer Studionet chain)
- **Auth/DB:** Firebase (Firestore for agreement metadata, reveals, reviews)
- **Privacy:** Client-side commitment hashing (keccak256), local IndexedDB vault for private assumptions
- **Deployment:** Vercel

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
- Review verdicts (AI-consensus structured JSON)

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

GenLayer does not simply store agreements. It interprets contradiction claims based on revealed assumptions and evidence using `gl.nondet.exec_prompt()` and `gl.eq_principle.prompt_comparative()` for multi-validator consensus.

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
- MetaMask browser extension
- GenLayer Studionet access

### Install

```bash
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_GENLAYER_CHAIN=studionet
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Run Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GenLayer Studionet Configuration

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Deploy `contracts/ContradictionProtocol.py`
3. Copy the deployed contract address to `.env.local`
4. MetaMask auto-switches to GenLayer Studionet (Chain ID: 61999 / `0xf22f`)

## Contract Architecture

The GenLayer Intelligent Contract (`contracts/ContradictionProtocol.py`) uses:

- `TreeMap[str, str]` for on-chain storage (agreements, reveals, reviews)
- `@gl.public.write` methods: `create_agreement`, `submit_reveal`, `review_contradiction`, `respond_to_reveal`, `finalise_resolution`, `activate_agreement`
- `@gl.public.view` methods: `get_agreement`, `get_reveal`, `get_review`, `get_user_agreements`, `get_protocol_stats`
- `gl.nondet.exec_prompt()` for LLM-based contradiction evaluation
- `gl.eq_principle.prompt_comparative()` for multi-validator consensus on verdicts

## Wallet Connection

Contradiction Protocol uses injected wallet authentication only.

- Connect MetaMask or any injected provider
- Auto-switches to GenLayer Studionet chain (61999)
- No email/password
- No embedded wallet
- No WalletConnect required

## Demo Walkthrough

1. Open the app and click "Enter Protocol"
2. Connect MetaMask wallet
3. Click "New Agreement"
4. Enter counterparty address and agreement title
5. Write agreement summary (public)
6. Add private assumptions with trigger conditions
7. Preview commitment hashes
8. Sign and commit agreement to GenLayer (MetaMask popup)
9. Open agreement detail
10. Click "Reveal Assumption"
11. Select the affected assumption from local vault
12. Add URL/text evidence of the changed condition
13. Preview what will be revealed vs what stays private
14. Sign and submit the reveal (MetaMask popup)
15. Open the Review Room
16. Click "Run Contradiction Review"
17. GenLayer validators interpret the claim via AI consensus
18. See the structured verdict with recommended action

## Known Limitations

- Local vault uses IndexedDB and is browser-specific — export a backup before clearing browser data
- File upload evidence is planned for a future phase
- Counterparty notification is manual in this MVP
- Fund movement is not implemented; this is an interpretation layer only
