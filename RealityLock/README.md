# RealityLock — Canonical Agreement Engine on GenLayer

RealityLock turns messy agreement evidence into a canonical on-chain agreement state. Users create a case, submit conflicting evidence, and request a decentralized AI review. The GenLayer Intelligent Contract reconstructs the agreement state and writes a compact verdict on-chain.

## Why GenLayer

GenLayer Intelligent Contracts support non-deterministic operations (LLM reasoning, web interpretation) and use the Equivalence Principle so validators agree on structured outputs even when wording varies. This makes GenLayer ideal for analyzing disputed agreements where context, intent, and contradictions must be resolved.

## Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Contract:** GenLayer Intelligent Contract (Python)
- **Network:** GenLayer StudioNet (Chain ID `61999`, Currency `GEN`)
- **RPC:** `https://studio.genlayer.com/api`
- **Explorer:** `https://explorer-studio.genlayer.com`

## Setup

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- GEN tokens on StudioNet

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and set your deployed contract address:

```bash
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000.

### Build

```bash
npm run build
npm start
```

## Contract Deployment

The contract file is at `contracts/reality_lock.py`. Deploy it to GenLayer StudioNet using GenLayer Studio or the CLI:

1. Open [GenLayer Studio](https://studio.genlayer.com)
2. Upload `contracts/reality_lock.py`
3. Deploy to StudioNet
4. Copy the deployed contract address into `.env.local`

## Demo

Visit `/demo` to see a pre-loaded dispute with conflicting evidence and a resolved verdict. No wallet or contract required.

The demo case: "Login and Dashboard Scope Dispute" — Party A says login only was agreed, Party B claims dashboard was included. Four evidence fragments produce a `PARTIAL_AGREEMENT` verdict.

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/cases` | Case index — list all cases from contract |
| `/cases/new` | Create a new dispute case |
| `/cases/[id]` | Case chamber — evidence, reconstruction, verdict |
| `/demo` | Static demo with pre-loaded dispute data |

## Contract Methods

| Method | Type | Description |
|---|---|---|
| `create_case` | Write | Create a new dispute case |
| `submit_evidence` | Write | Submit evidence reference to a case |
| `request_review` | Write (non-deterministic) | Trigger GenLayer AI review |
| `appeal` | Write | Submit an appeal against a verdict |
| `get_case` | Read | Get case record by ID |
| `get_all_cases` | Read | Get all cases |
| `get_evidence` | Read | Get evidence record by ID |
| `get_case_evidence_ids` | Read | Get all evidence IDs for a case |
| `get_verdict` | Read | Get verdict JSON for a case |

## Verdict Schema

The canonical verdict contains:

- `verdict` — overall determination
- `agreement_state` — agreement status
- `confirmed_terms` — terms verified by evidence
- `excluded_terms` — terms not part of agreement
- `changed_terms` — terms that were modified
- `ambiguous_terms` — terms that remain unclear
- `prevailing_party` — which party's position is supported
- `confidence` — LOW / MEDIUM / HIGH
- `decisive_evidence_ids` — evidence that drove the decision
- `short_reason` — brief explanation

## Intentionally Skipped in MVP

- Payment / escrow
- DAO governance
- Private file uploads
- Backend AI / Supabase
- Multi-chain support
- Notifications
- User roles beyond wallet address

## Known Limitations

- Contract reads depend on GenLayer StudioNet RPC availability
- Non-deterministic review takes time for validator consensus
- Evidence is stored as references (URLs, hashes, text excerpts), not files
- Appeal resolution (`resolve_appeal`) is not fully implemented in MVP
- No real-time transaction status updates (polling-based)
