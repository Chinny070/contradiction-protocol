# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json


class ContradictionProtocol(gl.Contract):
    agreements: TreeMap[str, str]
    reveals: TreeMap[str, str]
    reviews: TreeMap[str, str]
    user_agreements: TreeMap[str, str]
    agreement_count: u256
    reveal_count: u256
    review_count: u256

    def __init__(self):
        self.agreement_count = u256(0)
        self.reveal_count = u256(0)
        self.review_count = u256(0)

    # ── Helpers ──────────────────────────────────────────────

    def _add_user_index(self, addr: str, agreement_id: str) -> None:
        existing = self.user_agreements.get(addr, "[]")
        ids = json.loads(existing)
        if agreement_id not in ids:
            ids.append(agreement_id)
        self.user_agreements[addr] = json.dumps(ids)

    # ── Writes ──────────────────────────────────────────────

    @gl.public.write
    def create_agreement(
        self,
        agreement_id: str,
        counterparty: str,
        agreement_summary: str,
        agreement_root: str,
        assumptions_root: str,
        assumption_commitments_json: str,
    ) -> str:
        caller = str(gl.message.sender_address)
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
        self.agreement_count = self.agreement_count + u256(1)
        self._add_user_index(caller, agreement_id)
        self._add_user_index(counterparty, agreement_id)
        return agreement_id

    @gl.public.write
    def activate_agreement(self, agreement_id: str) -> None:
        caller = str(gl.message.sender_address)
        raw = self.agreements.get(agreement_id)
        if raw is None:
            raise gl.vm.UserError("Agreement not found")
        record = json.loads(raw)
        if record["counterparty"] != caller:
            raise gl.vm.UserError("Only counterparty can activate")
        if record["status"] != "COMMITTED":
            raise gl.vm.UserError("Agreement not in COMMITTED status")
        record["status"] = "ACTIVE"
        self.agreements[agreement_id] = json.dumps(record)

    @gl.public.write
    def submit_reveal(
        self,
        reveal_id: str,
        agreement_id: str,
        commitment: str,
        revealed_assumption: str,
        salt: str,
        evidence_json: str,
        requested_action: str,
    ) -> str:
        caller = str(gl.message.sender_address)

        reveal_record = {
            "id": reveal_id,
            "agreement_id": agreement_id,
            "commitment": commitment,
            "revealed_assumption": revealed_assumption,
            "salt": salt,
            "evidence": json.loads(evidence_json),
            "requested_action": requested_action,
            "status": "SUBMITTED",
            "created_by": caller,
            "reviews": [],
        }
        self.reveals[reveal_id] = json.dumps(reveal_record)
        self.reveal_count = self.reveal_count + u256(1)

        raw = self.agreements.get(agreement_id)
        if raw is not None:
            record = json.loads(raw)
            record["status"] = "CHALLENGED"
            record["reveals"].append(reveal_id)
            self.agreements[agreement_id] = json.dumps(record)

        return reveal_id

    @gl.public.write
    def respond_to_reveal(self, reveal_id: str, response_json: str) -> None:
        raw = self.reveals.get(reveal_id)
        if raw is None:
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(raw)
        reveal["counterparty_response"] = json.loads(response_json)
        self.reveals[reveal_id] = json.dumps(reveal)

    @gl.public.write
    def finalise_resolution(self, reveal_id: str) -> None:
        raw = self.reveals.get(reveal_id)
        if raw is None:
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(raw)
        review_ids = reveal.get("reviews", [])
        if not review_ids:
            raise gl.vm.UserError("No review exists for this reveal")
        review_raw = self.reviews.get(review_ids[-1])
        if review_raw is None:
            raise gl.vm.UserError("Review not found")
        review = json.loads(review_raw)
        verdict = json.loads(review["verdict_json"])
        action = verdict.get("recommendedAction", "")

        agreement_id = reveal["agreement_id"]
        agr_raw = self.agreements.get(agreement_id)
        if agr_raw is not None:
            agreement = json.loads(agr_raw)
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
        raw = self.reveals.get(reveal_id)
        if raw is None:
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(raw)

        agr_raw = self.agreements.get(reveal["agreement_id"])
        agreement = json.loads(agr_raw) if agr_raw is not None else {}

        evidence_lines = []
        for item in reveal.get("evidence", []):
            line = "- [" + item.get("type", "TEXT") + "] " + item.get("title", "") + ": " + item.get("summary", "")
            if item.get("url"):
                line = line + " (source: " + item["url"] + ")"
            evidence_lines.append(line)
        evidence_text = "\n".join(evidence_lines) if evidence_lines else "No evidence provided."

        prompt = (
            "You are a neutral evaluator for a private agreement contradiction claim.\n"
            "You are NOT a lawyer; do NOT give legal advice.\n\n"
            "Your task: decide whether a revealed assumption that cryptographically matches a prior commitment\n"
            "has been contradicted by a real-world change in conditions.\n\n"
            "Return ONLY valid JSON with exactly these fields (no markdown, no prose outside JSON):\n"
            "{\n"
            '  "revealedClauseBelongs": true or false,\n'
            '  "conditionChanged": true or false,\n'
            '  "contradictionFound": true or false,\n'
            '  "materiality": "LOW" or "MEDIUM" or "HIGH",\n'
            '  "evidenceQuality": "WEAK" or "MODERATE" or "STRONG",\n'
            '  "recommendedAction": "CONTINUE" or "PAUSE" or "RENEGOTIATE" or "SETTLE_PARTIAL" or "SETTLE_FULL" or "REJECT_CLAIM" or "INSUFFICIENT_EVIDENCE",\n'
            '  "reasoning": "short explanation, max 3 sentences",\n'
            '  "safetyCaveat": "safety note"\n'
            "}\n\n"
            "Agreement summary:\n" + agreement.get("summary", "") + "\n\n"
            "Revealed assumption:\n" + reveal.get("revealed_assumption", "") + "\n\n"
            "Evidence submitted:\n" + evidence_text + "\n\n"
            "Requested action by revealing party:\n" + reveal.get("requested_action", "") + "\n\n"
            "Evaluate carefully. Return ONLY the JSON object."
        )

        def call_llm() -> str:
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            print(result)
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "Responses are equivalent if they reach the same recommendedAction "
            "and materiality classification with the same essential reasoning, "
            "even if exact wording differs.",
        )

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
                "reasoning": "Could not parse AI consensus response.",
                "safetyCaveat": "This is an AI-consensus interpretation, not legal advice.",
            }

        review_id = reveal_id + "-review-" + str(int(self.review_count))
        review_record = {
            "id": review_id,
            "reveal_id": reveal_id,
            "verdict_json": json.dumps(verdict),
            "recommended_action": verdict.get("recommendedAction", ""),
            "materiality": verdict.get("materiality", ""),
            "evidence_quality": verdict.get("evidenceQuality", ""),
        }
        self.reviews[review_id] = json.dumps(review_record)
        self.review_count = self.review_count + u256(1)

        reveal["status"] = "DECIDED"
        reveal["reviews"].append(review_id)
        self.reveals[reveal_id] = json.dumps(reveal)
        return review_id

    # ── Views ────────────────────────────────────────────────

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> str:
        raw = self.agreements.get(agreement_id)
        if raw is None:
            return "null"
        return raw

    @gl.public.view
    def get_reveal(self, reveal_id: str) -> str:
        raw = self.reveals.get(reveal_id)
        if raw is None:
            return "null"
        return raw

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        raw = self.reviews.get(review_id)
        if raw is None:
            return "null"
        return raw

    @gl.public.view
    def get_user_agreements(self, user_address: str) -> str:
        ids_raw = self.user_agreements.get(user_address, "[]")
        ids = json.loads(ids_raw)
        records = []
        for aid in ids:
            raw = self.agreements.get(aid)
            if raw is not None:
                records.append(json.loads(raw))
        return json.dumps(records)

    @gl.public.view
    def get_protocol_stats(self) -> str:
        return json.dumps({
            "total_agreements": str(self.agreement_count),
            "total_reveals": str(self.reveal_count),
            "total_reviews": str(self.review_count),
        })
