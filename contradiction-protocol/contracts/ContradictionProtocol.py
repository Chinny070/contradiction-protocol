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
    def create_agreement(self, agreement_id: str, counterparty: str, agreement_summary: str, agreement_root: str, assumptions_root: str, assumption_commitments_json: str) -> str:
        caller = gl.message.sender_address.as_hex
        commitments = json.loads(assumption_commitments_json)
        record = json.dumps({
            "id": agreement_id,
            "creator": caller,
            "counterparty": counterparty,
            "summary": agreement_summary,
            "agreement_root": agreement_root,
            "assumptions_root": assumptions_root,
            "commitments": commitments,
            "status": "COMMITTED",
            "reveals": []
        })
        self.agreements[agreement_id] = record
        self.agreement_count = self.agreement_count + u256(1)

        if caller in self.user_agreements:
            ids_creator = json.loads(self.user_agreements[caller])
        else:
            ids_creator = []
        if agreement_id not in ids_creator:
            ids_creator.append(agreement_id)
        self.user_agreements[caller] = json.dumps(ids_creator)

        if counterparty in self.user_agreements:
            ids_cp = json.loads(self.user_agreements[counterparty])
        else:
            ids_cp = []
        if agreement_id not in ids_cp:
            ids_cp.append(agreement_id)
        self.user_agreements[counterparty] = json.dumps(ids_cp)

        return agreement_id

    @gl.public.write
    def activate_agreement(self, agreement_id: str) -> None:
        caller = gl.message.sender_address.as_hex
        if agreement_id not in self.agreements:
            raise gl.vm.UserError("Agreement not found")
        record = json.loads(self.agreements[agreement_id])
        if record["counterparty"] != caller:
            raise gl.vm.UserError("Only counterparty can activate")
        if record["status"] != "COMMITTED":
            raise gl.vm.UserError("Agreement not in COMMITTED status")
        record["status"] = "ACTIVE"
        self.agreements[agreement_id] = json.dumps(record)

    @gl.public.write
    def submit_reveal(self, reveal_id: str, agreement_id: str, commitment: str, revealed_assumption: str, salt: str, evidence_json: str, requested_action: str) -> str:
        caller = gl.message.sender_address.as_hex
        reveal_record = json.dumps({
            "id": reveal_id,
            "agreement_id": agreement_id,
            "commitment": commitment,
            "revealed_assumption": revealed_assumption,
            "salt": salt,
            "evidence": json.loads(evidence_json),
            "requested_action": requested_action,
            "status": "SUBMITTED",
            "created_by": caller,
            "reviews": []
        })
        self.reveals[reveal_id] = reveal_record
        self.reveal_count = self.reveal_count + u256(1)

        if agreement_id in self.agreements:
            record = json.loads(self.agreements[agreement_id])
            record["status"] = "CHALLENGED"
            record["reveals"].append(reveal_id)
            self.agreements[agreement_id] = json.dumps(record)

        return reveal_id

    @gl.public.write
    def respond_to_reveal(self, reveal_id: str, response_json: str) -> None:
        if reveal_id not in self.reveals:
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(self.reveals[reveal_id])
        reveal["counterparty_response"] = json.loads(response_json)
        self.reveals[reveal_id] = json.dumps(reveal)

    @gl.public.write
    def finalise_resolution(self, reveal_id: str) -> None:
        if reveal_id not in self.reveals:
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(self.reveals[reveal_id])
        review_ids = reveal.get("reviews", [])
        if not review_ids:
            raise gl.vm.UserError("No review exists for this reveal")
        last_review_id = review_ids[-1]
        if last_review_id not in self.reviews:
            raise gl.vm.UserError("Review not found")
        review = json.loads(self.reviews[last_review_id])
        verdict = json.loads(review["verdict_json"])
        action = verdict.get("recommendedAction", "")

        agreement_id = reveal["agreement_id"]
        if agreement_id in self.agreements:
            agreement = json.loads(self.agreements[agreement_id])
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
        if reveal_id not in self.reveals:
            raise gl.vm.UserError("Reveal not found")
        reveal = json.loads(self.reveals[reveal_id])

        agreement_id = reveal["agreement_id"]
        if agreement_id in self.agreements:
            agreement = json.loads(self.agreements[agreement_id])
        else:
            agreement = {}

        evidence_lines = []
        fetched_sources = []
        for item in reveal.get("evidence", []):
            line = "- [" + item.get("type", "TEXT") + "] " + item.get("title", "") + ": " + item.get("summary", "")
            evidence_lines.append(line)
            url = item.get("url", "")
            if url and (url.startswith("http://") or url.startswith("https://")):
                page_content = gl.get_webpage(url, mode="text")
                snippet = page_content[:3000]
                fetched_sources.append("Fetched from " + url + ":\n" + snippet)
        if evidence_lines:
            evidence_text = "\n".join(evidence_lines)
        else:
            evidence_text = "No evidence provided."

        if fetched_sources:
            verified_text = "\n\n---\n\n".join(fetched_sources)
        else:
            verified_text = "No URLs were provided for on-chain verification."

        summary_text = agreement.get("summary", "")
        assumption_text = reveal.get("revealed_assumption", "")
        action_text = reveal.get("requested_action", "")

        prompt = (
            "You are a neutral evaluator for a private agreement contradiction claim.\n"
            "You are NOT a lawyer; do NOT give legal advice.\n\n"
            "Your task: decide whether a revealed assumption that cryptographically matches a prior commitment\n"
            "has been contradicted by a real-world change in conditions.\n\n"
            "IMPORTANT: You have been given VERIFIED web content fetched on-chain by the validators.\n"
            "Use the verified content to check whether the claiming party's evidence is real.\n"
            "If no verified content was fetched, note that evidence is unverified and weigh it accordingly.\n\n"
            "Return ONLY valid JSON with exactly these fields:\n"
            '{"revealedClauseBelongs": true, "conditionChanged": true, "contradictionFound": true, '
            '"materiality": "LOW", "evidenceQuality": "WEAK", "recommendedAction": "CONTINUE", '
            '"reasoning": "short explanation", "safetyCaveat": "safety note"}\n\n'
            "Where materiality is LOW or MEDIUM or HIGH.\n"
            "Where evidenceQuality is WEAK or MODERATE or STRONG.\n"
            "Where recommendedAction is CONTINUE or PAUSE or RENEGOTIATE or SETTLE_PARTIAL or SETTLE_FULL or REJECT_CLAIM or INSUFFICIENT_EVIDENCE.\n\n"
            "Agreement summary:\n" + summary_text + "\n\n"
            "Revealed assumption:\n" + assumption_text + "\n\n"
            "Evidence submitted by claiming party:\n" + evidence_text + "\n\n"
            "Verified web content fetched on-chain:\n" + verified_text + "\n\n"
            "Requested action by revealing party:\n" + action_text + "\n\n"
            "Cross-reference the claimed evidence against the verified web content.\n"
            "Evaluate carefully. Return ONLY the JSON object.\n"
            "Do not include markdown formatting. Do not include ```json or ```.\n"
            "Your output must be only JSON without any formatting prefix or suffix."
        )

        def call_llm() -> str:
            result = gl.nondet.exec_prompt(prompt)
            result = result.replace("```json", "").replace("```", "")
            print(result)
            return result

        result = gl.eq_principle.prompt_comparative(
            call_llm,
            "The value of recommendedAction and materiality must match"
        )

        parsed_result = json.loads(result)

        review_id = reveal_id + "-review"
        review_record = json.dumps({
            "id": review_id,
            "reveal_id": reveal_id,
            "verdict_json": json.dumps(parsed_result),
            "recommended_action": parsed_result.get("recommendedAction", ""),
            "materiality": parsed_result.get("materiality", ""),
            "evidence_quality": parsed_result.get("evidenceQuality", "")
        })
        self.reviews[review_id] = review_record
        self.review_count = self.review_count + u256(1)

        reveal["status"] = "DECIDED"
        reveal["reviews"].append(review_id)
        self.reveals[reveal_id] = json.dumps(reveal)
        return review_id

    @gl.public.view
    def get_agreement(self, agreement_id: str) -> str:
        if agreement_id in self.agreements:
            return self.agreements[agreement_id]
        return "{}"

    @gl.public.view
    def get_reveal(self, reveal_id: str) -> str:
        if reveal_id in self.reveals:
            return self.reveals[reveal_id]
        return "{}"

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        if review_id in self.reviews:
            return self.reviews[review_id]
        return "{}"

    @gl.public.view
    def get_user_agreements(self, user_address: str) -> str:
        if user_address not in self.user_agreements:
            return "[]"
        ids = json.loads(self.user_agreements[user_address])
        records = []
        for aid in ids:
            if aid in self.agreements:
                records.append(json.loads(self.agreements[aid]))
        return json.dumps(records)

    @gl.public.view
    def get_protocol_stats(self) -> str:
        return json.dumps({
            "total_agreements": str(self.agreement_count),
            "total_reveals": str(self.reveal_count),
            "total_reviews": str(self.review_count)
        })
