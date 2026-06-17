# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json

from genlayer import *


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
        caller = gl.message.sender_address.as_hex
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

        existing_creator = self.user_agreements.get(caller, "[]")
        ids_creator = json.loads(existing_creator)
        if agreement_id not in ids_creator:
            ids_creator.append(agreement_id)
        self.user_agreements[caller] = json.dumps(ids_creator)

        existing_cp = self.user_agreements.get(counterparty, "[]")
        ids_cp = json.loads(existing_cp)
        if agreement_id not in ids_cp:
            ids_cp.append(agreement_id)
        self.user_agreements[counterparty] = json.dumps(ids_cp)

        return agreement_id

    @gl.public.write
    def activate_agreement(self, agreement_id: str) -> None:
        caller = gl.message.sender_address.as_hex
        raw = self.agreements.get(agreement_id, "")
        if raw == "":
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
        caller = gl.message.sender_address.as_hex
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

        raw = self.agreements.get(agreement_id, "")
        if raw != "":
            record = json.loads(raw)
            record["status"] = "CHALLENGED"
            record["reveals"].append(reveal_id)
            self.agreements[agreement_id] = json.dumps(record)

        return reveal_id

    @gl.public.write
    def respond_to_reveal(self, reveal_id: str, response_json: str) -> None:
        raw = self.reveals.get(reveal_id, "")
        if raw == "":
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(raw)
        reveal["counterparty_response"] = json.loads(response_json)
        self.reveals[reveal_id] = json.dumps(reveal)

    @gl.public.write
    def finalise_resolution(self, reveal_id: str) -> None:
        raw = self.reveals.get(reveal_id, "")
        if raw == "":
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(raw)
        review_ids = reveal.get("reviews", [])
        if not review_ids:
            raise gl.vm.UserError("No review exists for this reveal")
        review_raw = self.reviews.get(review_ids[-1], "")
        if review_raw == "":
            raise gl.vm.UserError("Review not found")
        review = json.loads(review_raw)
        verdict = json.loads(review["verdict_json"])
        action = verdict.get("recommendedAction", "")

        agreement_id = reveal["agreement_id"]
        agr_raw = self.agreements.get(agreement_id, "")
        if agr_raw != "":
            agreement = json.loads(agr_raw)
            if action == "CONTINUE" or action == "REJECT_CLAIM":
                agreement["status"] = "ACTIVE"
            elif action == "PAUSE":
                agreement["status"] = "PAUSED"
            elif action == "RENEGOTIATE":
                agreement["status"] = "RENEGOTIATION_REQUESTED"
            elif action == "SETTLE_PARTIAL" or action == "SETTLE_FULL":
                agreement["status"] = "SETTLED"
            else:
                agreement["status"] = "CHALLENGED"
            self.agreements[agreement_id] = json.dumps(agreement)

        reveal["status"] = "DECIDED"
        self.reveals[reveal_id] = json.dumps(reveal)

    @gl.public.write
    def review_contradiction(self, reveal_id: str) -> str:
        raw = self.reveals.get(reveal_id, "")
        if raw == "":
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(raw)

        agr_raw = self.agreements.get(reveal["agreement_id"], "{}")
        agreement = json.loads(agr_raw)

        evidence_lines = []
        for item in reveal.get("evidence", []):
            line = "- [" + item.get("type", "TEXT") + "] " + item.get("title", "") + ": " + item.get("summary", "")
            evidence_lines.append(line)
        evidence_text = "\n".join(evidence_lines) if evidence_lines else "No evidence provided."

        summary_text = agreement.get("summary", "")
        assumption_text = reveal.get("revealed_assumption", "")
        action_text = reveal.get("requested_action", "")

        prompt = f"""You are a neutral evaluator for a private agreement contradiction claim.
You are NOT a lawyer; do NOT give legal advice.

Your task: decide whether a revealed assumption that cryptographically matches a prior commitment
has been contradicted by a real-world change in conditions.

Return ONLY valid JSON with exactly these fields (no markdown, no prose outside JSON):
{{
  "revealedClauseBelongs": true,
  "conditionChanged": true,
  "contradictionFound": true,
  "materiality": "LOW",
  "evidenceQuality": "WEAK",
  "recommendedAction": "CONTINUE",
  "reasoning": "short explanation",
  "safetyCaveat": "safety note"
}}

Where:
- revealedClauseBelongs: true or false
- conditionChanged: true or false
- contradictionFound: true or false
- materiality: "LOW" or "MEDIUM" or "HIGH"
- evidenceQuality: "WEAK" or "MODERATE" or "STRONG"
- recommendedAction: "CONTINUE" or "PAUSE" or "RENEGOTIATE" or "SETTLE_PARTIAL" or "SETTLE_FULL" or "REJECT_CLAIM" or "INSUFFICIENT_EVIDENCE"
- reasoning: short explanation, max 3 sentences
- safetyCaveat: safety note

Agreement summary:
{summary_text}

Revealed assumption:
{assumption_text}

Evidence submitted:
{evidence_text}

Requested action by revealing party:
{action_text}

Evaluate carefully. Return ONLY the JSON object."""

        def call_llm() -> str:
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            print(result)
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The value of recommendedAction and materiality must match",
        )

        parsed = json.loads(result)

        review_id = reveal_id + "-review"
        review_record = {
            "id": review_id,
            "reveal_id": reveal_id,
            "verdict_json": json.dumps(parsed),
            "recommended_action": parsed.get("recommendedAction", ""),
            "materiality": parsed.get("materiality", ""),
            "evidence_quality": parsed.get("evidenceQuality", ""),
        }
        self.reviews[review_id] = json.dumps(review_record)
        self.review_count = self.review_count + u256(1)

        reveal["status"] = "DECIDED"
        reveal["reviews"].append(review_id)
        self.reveals[reveal_id] = json.dumps(reveal)
        return review_id

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> str:
        return self.agreements.get(agreement_id, "{}")

    @gl.public.view
    def get_reveal(self, reveal_id: str) -> str:
        return self.reveals.get(reveal_id, "{}")

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        return self.reviews.get(review_id, "{}")

    @gl.public.view
    def get_user_agreements(self, user_address: str) -> str:
        ids_raw = self.user_agreements.get(user_address, "[]")
        ids = json.loads(ids_raw)
        records = []
        for aid in ids:
            raw = self.agreements.get(aid, "")
            if raw != "":
                records.append(json.loads(raw))
        return json.dumps(records)

    @gl.public.view
    def get_protocol_stats(self) -> str:
        return json.dumps({
            "total_agreements": int(self.agreement_count),
            "total_reveals": int(self.reveal_count),
            "total_reviews": int(self.review_count),
        })
