"""
ContradictionProtocol — GenLayer Intelligent Contract

Stores private agreement commitments on-chain and uses AI-validator consensus
(Equivalence Principle) to interpret contradiction claims when hidden assumptions
are revealed by a party.

Storage note: GenLayer TreeMap requires primitive or sized types as value types.
All complex records are JSON-serialised to str before storage.
"""

import json
import hashlib
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


class ContradictionProtocol(gl.Contract):
    # All values stored as JSON-serialised strings (TreeMap requires primitive types)
    agreements: TreeMap[str, str]
    reveals: TreeMap[str, str]
    reviews: TreeMap[str, str]
    # Maps address → JSON array of agreement IDs
    user_agreements: TreeMap[str, str]
    # Running counters
    agreement_count: u256
    reveal_count: u256
    review_count: u256

    def __init__(self) -> None:
        self.agreements = TreeMap()
        self.reveals = TreeMap()
        self.reviews = TreeMap()
        self.user_agreements = TreeMap()
        self.agreement_count = u256(0)
        self.reveal_count = u256(0)
        self.review_count = u256(0)

    # ── Helpers ──────────────────────────────────────────────

    def _short_id(self, seed: str) -> str:
        return hashlib.sha256(seed.encode()).hexdigest()[:16]

    def _add_user_index(self, addr: str, agreement_id: str) -> None:
        existing: list = json.loads(self.user_agreements.get(addr, "[]"))
        if agreement_id not in existing:
            existing.append(agreement_id)
        self.user_agreements[addr] = json.dumps(existing)

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
        caller = str(gl.message.sender_address)
        agreement_id = self._short_id(
            f"{caller}{counterparty}{agreement_root}{self.agreement_count}"
        )
        commitments = json.loads(assumption_commitments_json)
        record = {
            "id": agreement_id,
            "creator": caller,
            "counterparty": counterparty,
            "summary": agreement_summary,
            "agreement_root": agreement_root,
            "assumptions_root": assumptions_root,
            "commitments": commitments,
            "status": "COMMITTED",
            "reveals": [],
        }
        self.agreements[agreement_id] = json.dumps(record)
        self.agreement_count = u256(int(self.agreement_count) + 1)
        self._add_user_index(caller, agreement_id)
        self._add_user_index(counterparty, agreement_id)
        return agreement_id

    @gl.public.write
    def activate_agreement(self, agreement_id: str) -> None:
        caller = str(gl.message.sender_address)
        record = json.loads(self.agreements[agreement_id])
        assert record["counterparty"] == caller, "Only counterparty can activate"
        assert record["status"] == "COMMITTED", "Agreement not in COMMITTED status"
        record["status"] = "ACTIVE"
        self.agreements[agreement_id] = json.dumps(record)

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
        caller = str(gl.message.sender_address)
        record = json.loads(self.agreements[agreement_id])
        assert record["status"] in {"ACTIVE", "COMMITTED"}, "Agreement not active"
        assert caller in {record["creator"], record["counterparty"]}, "Not a party"
        assert requested_action in ALLOWED_ACTIONS, f"Invalid action: {requested_action}"
        assert commitment in record["commitments"], "Commitment not found in agreement"

        reveal_id = self._short_id(
            f"{agreement_id}{commitment}{self.reveal_count}"
        )
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
            "created_by": caller,
            "reviews": [],
        }
        self.reveals[reveal_id] = json.dumps(reveal_record)
        self.reveal_count = u256(int(self.reveal_count) + 1)

        # Mark agreement as challenged
        record["status"] = "CHALLENGED"
        record["reveals"].append(reveal_id)
        self.agreements[agreement_id] = json.dumps(record)
        return reveal_id

    @gl.public.write
    def respond_to_reveal(self, reveal_id: str, response_json: str) -> None:
        caller = str(gl.message.sender_address)
        reveal = json.loads(self.reveals[reveal_id])
        agreement = json.loads(self.agreements[reveal["agreement_id"]])
        assert caller in {agreement["creator"], agreement["counterparty"]}, "Not a party"
        reveal["counterparty_response"] = json.loads(response_json)
        self.reveals[reveal_id] = json.dumps(reveal)

    @gl.public.write
    def finalise_resolution(self, reveal_id: str) -> None:
        reveal = json.loads(self.reveals[reveal_id])
        review_ids = reveal.get("reviews", [])
        assert review_ids, "No review exists for this reveal"
        review = json.loads(self.reviews[review_ids[-1]])
        verdict = json.loads(review["verdict_json"])
        action = verdict.get("recommendedAction", "")

        agreement_id = reveal["agreement_id"]
        agreement = json.loads(self.agreements[agreement_id])

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
        self.agreements[agreement_id] = json.dumps(agreement)

        reveal["status"] = "DECIDED"
        self.reveals[reveal_id] = json.dumps(reveal)

    # ── GenLayer AI Review (non-deterministic) ───────────────

    @gl.public.write
    def review_contradiction(self, reveal_id: str) -> str:
        reveal = json.loads(self.reveals[reveal_id])
        agreement = json.loads(self.agreements[reveal["agreement_id"]])

        evidence_lines = []
        for item in reveal.get("evidence", []):
            line = f"- [{item.get('type', 'TEXT')}] {item.get('title', '')}: {item.get('summary', '')}"
            if item.get("url"):
                line += f" (source: {item['url']})"
            evidence_lines.append(line)
        evidence_text = "\n".join(evidence_lines) or "No evidence provided."

        prompt = f"""You are a neutral evaluator for a private agreement contradiction claim.
You are NOT a lawyer; do NOT give legal advice.

Your task: decide whether a revealed assumption that cryptographically matches a prior commitment
has been contradicted by a real-world change in conditions.

Return ONLY valid JSON with exactly these fields (no markdown, no prose outside JSON):
{{
  "revealedClauseBelongs": <true|false>,
  "conditionChanged": <true|false>,
  "contradictionFound": <true|false>,
  "materiality": "LOW" | "MEDIUM" | "HIGH",
  "evidenceQuality": "WEAK" | "MODERATE" | "STRONG",
  "recommendedAction": "CONTINUE" | "PAUSE" | "RENEGOTIATE" | "SETTLE_PARTIAL" | "SETTLE_FULL" | "REJECT_CLAIM" | "INSUFFICIENT_EVIDENCE",
  "reasoning": "<short explanation, max 3 sentences>",
  "followUpQuestions": ["<question1>", "<question2>"],
  "safetyCaveat": "<safety note>"
}}

Agreement summary:
{agreement.get("summary", "")}

Revealed assumption:
{reveal.get("revealed_assumption", "")}

Evidence submitted:
{evidence_text}

Requested action by revealing party:
{reveal.get("requested_action", "")}

Evaluate carefully. Return ONLY the JSON object."""

        def call_llm() -> str:
            response = gl.nondet.exec_prompt(prompt)
            return response.strip()

        raw = gl.eq_principle.prompt_comparative(
            call_llm,
            principle=(
                "Responses are equivalent if they reach the same recommendedAction "
                "and materiality classification with the same essential reasoning, "
                "even if exact wording differs."
            ),
        )

        # Parse — strip any accidental markdown fences
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            verdict = json.loads(raw[start:end])
        except Exception:
            verdict = {
                "revealedClauseBelongs": False,
                "conditionChanged": False,
                "contradictionFound": False,
                "materiality": "LOW",
                "evidenceQuality": "WEAK",
                "recommendedAction": "INSUFFICIENT_EVIDENCE",
                "reasoning": "Could not parse AI consensus response.",
                "followUpQuestions": [],
                "safetyCaveat": "This is an AI-consensus interpretation, not legal advice.",
            }

        assert verdict.get("materiality") in ALLOWED_MATERIALITY, "Invalid materiality"
        assert verdict.get("evidenceQuality") in ALLOWED_EVIDENCE_QUALITY, "Invalid evidenceQuality"
        assert verdict.get("recommendedAction") in ALLOWED_ACTIONS, "Invalid recommendedAction"

        review_id = self._short_id(f"{reveal_id}{self.review_count}")
        review_record = {
            "id": review_id,
            "reveal_id": reveal_id,
            "verdict_json": json.dumps(verdict),
            "recommended_action": verdict["recommendedAction"],
            "materiality": verdict["materiality"],
            "evidence_quality": verdict["evidenceQuality"],
        }
        self.reviews[review_id] = json.dumps(review_record)
        self.review_count = u256(int(self.review_count) + 1)

        reveal["status"] = "DECIDED"
        reveal["reviews"].append(review_id)
        self.reveals[reveal_id] = json.dumps(reveal)
        return review_id

    # ── Views ────────────────────────────────────────────────

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> str:
        raw = self.agreements.get(agreement_id)
        return raw if raw is not None else "null"

    @gl.public.view
    def get_reveal(self, reveal_id: str) -> str:
        raw = self.reveals.get(reveal_id)
        return raw if raw is not None else "null"

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        raw = self.reviews.get(review_id)
        return raw if raw is not None else "null"

    @gl.public.view
    def get_user_agreements(self, user_address: str) -> str:
        ids: list = json.loads(self.user_agreements.get(user_address, "[]"))
        records = []
        for aid in ids:
            raw = self.agreements.get(aid)
            if raw is not None:
                records.append(json.loads(raw))
        return json.dumps(records)

    @gl.public.view
    def get_protocol_stats(self) -> str:
        return json.dumps({
            "total_agreements": int(self.agreement_count),
            "total_reveals": int(self.reveal_count),
            "total_reviews": int(self.review_count),
        })
