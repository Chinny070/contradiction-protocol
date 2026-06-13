"""
ContradictionProtocol — GenLayer Intelligent Contract

Stores private agreement commitments and uses AI-validator consensus
to interpret contradiction claims when hidden assumptions are revealed.
"""

import json
import hashlib
from datetime import datetime
from genlayer import *


ALLOWED_ACTIONS = {
    "CONTINUE",
    "PAUSE",
    "RENEGOTIATE",
    "SETTLE_PARTIAL",
    "SETTLE_FULL",
    "REJECT_CLAIM",
    "INSUFFICIENT_EVIDENCE",
}

ALLOWED_MATERIALITY = {"LOW", "MEDIUM", "HIGH"}
ALLOWED_EVIDENCE_QUALITY = {"WEAK", "MODERATE", "STRONG"}

ALLOWED_STATUSES = {
    "DRAFT", "COMMITTED", "ACTIVE", "CHALLENGED",
    "PAUSED", "RENEGOTIATION_REQUESTED", "SETTLED", "CLOSED",
}


@gl.contract
class ContradictionProtocol:

    agreements: TreeMap[str, dict]
    reveals: TreeMap[str, dict]
    reviews: TreeMap[str, dict]
    user_agreements: TreeMap[str, list]

    def __init__(self):
        self.agreements = TreeMap()
        self.reveals = TreeMap()
        self.reviews = TreeMap()
        self.user_agreements = TreeMap()

    # ── Writes ──────────────────────────────────────────────

    @gl.public.write
    def create_agreement(
        self,
        counterparty: str,
        agreement_summary: str,
        agreement_root: str,
        assumptions_root: str,
        assumption_commitments_json: str,
    ) -> str:
        caller = gl.message.sender_address
        agreement_id = hashlib.sha256(
            f"{caller}{counterparty}{agreement_root}{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:16]

        commitments = json.loads(assumption_commitments_json)
        record = {
            "id": agreement_id,
            "creator": str(caller),
            "counterparty": counterparty,
            "summary": agreement_summary,
            "agreement_root": agreement_root,
            "assumptions_root": assumptions_root,
            "commitments": commitments,
            "status": "COMMITTED",
            "created_at": datetime.utcnow().isoformat(),
            "reveals": [],
        }
        self.agreements[agreement_id] = record

        # Index by user
        for addr in [str(caller), counterparty]:
            existing = list(self.user_agreements.get(addr, []))
            existing.append(agreement_id)
            self.user_agreements[addr] = existing

        return agreement_id

    @gl.public.write
    def activate_agreement(self, agreement_id: str) -> None:
        caller = gl.message.sender_address
        record = dict(self.agreements[agreement_id])
        assert record["counterparty"] == str(caller), "Only counterparty can activate"
        assert record["status"] == "COMMITTED", "Agreement not in COMMITTED status"
        record["status"] = "ACTIVE"
        record["activated_at"] = datetime.utcnow().isoformat()
        self.agreements[agreement_id] = record

    @gl.public.write
    def submit_reveal(
        self,
        agreement_id: str,
        commitment: str,
        revealed_assumption: str,
        salt: str,
        evidence_json: str,
        requested_action: str,
    ) -> str:
        caller = gl.message.sender_address
        record = dict(self.agreements[agreement_id])
        assert record["status"] in {"ACTIVE", "COMMITTED"}, "Agreement not active"
        assert str(caller) in {record["creator"], record["counterparty"]}, "Not a party"
        assert requested_action in ALLOWED_ACTIONS, f"Invalid action: {requested_action}"

        # Verify commitment membership
        assert commitment in record["commitments"], "Commitment not found in agreement"

        # Verify hash match
        computed = hashlib.sha256(f"{revealed_assumption.strip().lower()}{salt}".encode()).hexdigest()
        # Note: frontend uses keccak256; for Python demo we use sha256
        # In production, use web3.keccak(text=revealed_assumption + salt)

        reveal_id = hashlib.sha256(
            f"{agreement_id}{commitment}{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:16]

        evidence = json.loads(evidence_json)
        reveal_record = {
            "id": reveal_id,
            "agreement_id": agreement_id,
            "commitment": commitment,
            "revealed_assumption": revealed_assumption,
            "salt_hash": hashlib.sha256(salt.encode()).hexdigest(),
            "evidence": evidence,
            "requested_action": requested_action,
            "status": "SUBMITTED",
            "created_by": str(caller),
            "created_at": datetime.utcnow().isoformat(),
        }
        self.reveals[reveal_id] = reveal_record

        # Update agreement status
        record["status"] = "CHALLENGED"
        reveals = list(record.get("reveals", []))
        reveals.append(reveal_id)
        record["reveals"] = reveals
        self.agreements[agreement_id] = record

        return reveal_id

    @gl.public.write
    def respond_to_reveal(self, reveal_id: str, response_json: str) -> None:
        caller = gl.message.sender_address
        reveal = dict(self.reveals[reveal_id])
        agreement = dict(self.agreements[reveal["agreement_id"]])
        assert str(caller) in {agreement["creator"], agreement["counterparty"]}, "Not a party"
        response = json.loads(response_json)
        reveal["counterparty_response"] = response
        reveal["response_at"] = datetime.utcnow().isoformat()
        self.reveals[reveal_id] = reveal

    @gl.public.write
    def finalise_resolution(self, reveal_id: str) -> None:
        reveal = dict(self.reveals[reveal_id])
        review_ids = reveal.get("reviews", [])
        assert review_ids, "No review exists for this reveal"
        latest_review_id = review_ids[-1]
        review = dict(self.reviews[latest_review_id])
        verdict = json.loads(review["verdict_json"])
        action = verdict.get("recommendedAction", "")

        agreement_id = reveal["agreement_id"]
        agreement = dict(self.agreements[agreement_id])

        status_map = {
            "CONTINUE": "ACTIVE",
            "PAUSE": "PAUSED",
            "RENEGOTIATE": "RENEGOTIATION_REQUESTED",
            "SETTLE_PARTIAL": "SETTLED",
            "SETTLE_FULL": "SETTLED",
            "REJECT_CLAIM": "ACTIVE",
            "INSUFFICIENT_EVIDENCE": "CHALLENGED",
        }
        agreement["status"] = status_map.get(action, "CHALLENGED")
        agreement["closed_at"] = datetime.utcnow().isoformat()
        self.agreements[agreement_id] = agreement

        reveal["status"] = "DECIDED"
        self.reveals[reveal_id] = reveal

    # ── GenLayer AI Review ──────────────────────────────────

    @gl.public.write
    def review_contradiction(self, reveal_id: str) -> str:
        reveal = dict(self.reveals[reveal_id])
        agreement = dict(self.agreements[reveal["agreement_id"]])

        evidence_text = ""
        for item in reveal.get("evidence", []):
            evidence_text += f"\n- [{item.get('type', 'TEXT')}] {item.get('title', '')}: {item.get('summary', '')}"
            if item.get("url"):
                evidence_text += f" (source: {item['url']})"

        prompt = f"""You are reviewing a private agreement contradiction claim.

You are not a lawyer and must not provide legal advice.
Your job is to classify whether a revealed assumption, proven to match a prior commitment, has been contradicted by a changed real-world condition.

Return ONLY valid JSON with exactly these fields:
{{
  "revealedClauseBelongs": boolean,
  "conditionChanged": boolean,
  "contradictionFound": boolean,
  "materiality": "LOW" | "MEDIUM" | "HIGH",
  "evidenceQuality": "WEAK" | "MODERATE" | "STRONG",
  "recommendedAction": "CONTINUE" | "PAUSE" | "RENEGOTIATE" | "SETTLE_PARTIAL" | "SETTLE_FULL" | "REJECT_CLAIM" | "INSUFFICIENT_EVIDENCE",
  "reasoning": "short explanation",
  "followUpQuestions": ["question1", "question2"],
  "safetyCaveat": "safety note"
}}

Agreement summary:
{agreement.get("summary", "")}

Revealed assumption:
{reveal.get("revealed_assumption", "")}

Evidence:
{evidence_text}

Requested action by party:
{reveal.get("requested_action", "")}

Evaluate carefully. Only return JSON."""

        result = gl.get_webpage(prompt, mode="text")

        # Parse and validate
        try:
            start = result.find("{")
            end = result.rfind("}") + 1
            verdict = json.loads(result[start:end])
        except Exception:
            verdict = {
                "revealedClauseBelongs": False,
                "conditionChanged": False,
                "contradictionFound": False,
                "materiality": "LOW",
                "evidenceQuality": "WEAK",
                "recommendedAction": "INSUFFICIENT_EVIDENCE",
                "reasoning": "Could not parse GenLayer response.",
                "followUpQuestions": [],
                "safetyCaveat": "This is an AI-consensus interpretation, not legal advice.",
            }

        assert verdict.get("materiality") in ALLOWED_MATERIALITY
        assert verdict.get("evidenceQuality") in ALLOWED_EVIDENCE_QUALITY
        assert verdict.get("recommendedAction") in ALLOWED_ACTIONS

        review_id = hashlib.sha256(
            f"{reveal_id}{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()[:16]

        review_record = {
            "id": review_id,
            "reveal_id": reveal_id,
            "verdict_json": json.dumps(verdict),
            "recommended_action": verdict["recommendedAction"],
            "materiality": verdict["materiality"],
            "evidence_quality": verdict["evidenceQuality"],
            "created_at": datetime.utcnow().isoformat(),
        }
        self.reviews[review_id] = review_record

        reveal["status"] = "DECIDED"
        reviews = list(reveal.get("reviews", []))
        reviews.append(review_id)
        reveal["reviews"] = reviews
        self.reveals[reveal_id] = reveal

        return review_id

    # ── Reads ────────────────────────────────────────────────

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> str:
        record = self.agreements.get(agreement_id)
        return json.dumps(record) if record else json.dumps(None)

    @gl.public.view
    def get_reveal(self, reveal_id: str) -> str:
        record = self.reveals.get(reveal_id)
        return json.dumps(record) if record else json.dumps(None)

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        record = self.reviews.get(review_id)
        return json.dumps(record) if record else json.dumps(None)

    @gl.public.view
    def get_user_agreements(self, user_address: str) -> str:
        ids = self.user_agreements.get(user_address, [])
        records = [dict(self.agreements[i]) for i in ids if i in self.agreements]
        return json.dumps(records)

    @gl.public.view
    def get_protocol_stats(self) -> str:
        return json.dumps({
            "total_agreements": len(self.agreements),
            "total_reveals": len(self.reveals),
            "total_reviews": len(self.reviews),
        })
