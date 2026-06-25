import json
from backend.node.genvm.icontract import IContract
from backend.node.genvm.equivalence_principle import call_llm_with_principle


class RealityLock(IContract):
    def __init__(self):
        self.cases = {}
        self.evidence = {}
        self.appeals = {}
        self.case_count = 0

    def create_case(
        self,
        case_id: str,
        title: str,
        agreement_summary: str,
        party_a: str,
        party_b: str,
        created_at_note: str,
    ) -> str:
        if not title or len(title) > 200:
            raise Exception("Title must be 1-200 characters")
        if not agreement_summary or len(agreement_summary) > 2000:
            raise Exception("Summary must be 1-2000 characters")
        if not party_a or len(party_a) > 200:
            raise Exception("Party A label must be 1-200 characters")
        if not party_b or len(party_b) > 200:
            raise Exception("Party B label must be 1-200 characters")
        if case_id in self.cases:
            raise Exception("Case ID already exists")

        self.cases[case_id] = {
            "case_id": case_id,
            "creator": self.contract_runner.from_address,
            "title": title,
            "agreement_summary": agreement_summary,
            "party_a": party_a,
            "party_b": party_b,
            "status": "OPEN",
            "evidence_count": 0,
            "created_at_note": created_at_note[:200] if created_at_note else "",
            "final_verdict_json": "",
            "appeal_count": 0,
        }
        self.case_count += 1
        return case_id

    def submit_evidence(
        self,
        case_id: str,
        evidence_id: str,
        evidence_type: str,
        title: str,
        content_ref: str,
        excerpt: str,
        claim: str,
        submitted_at_note: str,
    ) -> str:
        if case_id not in self.cases:
            raise Exception("Case not found")
        case = self.cases[case_id]
        if case["status"] in ("APPEAL_RESOLVED",):
            raise Exception("Case is finalized")

        allowed_types = [
            "TEXT",
            "SCREENSHOT_URL",
            "PDF_URL",
            "CHAT_LOG",
            "EMAIL_EXCERPT",
            "GITHUB_COMMIT",
            "VIDEO_URL",
            "OTHER_URL",
        ]
        if evidence_type not in allowed_types:
            raise Exception(f"Evidence type must be one of: {allowed_types}")
        if not title or len(title) > 200:
            raise Exception("Evidence title must be 1-200 characters")
        if len(content_ref) > 500:
            raise Exception("Content reference must be under 500 characters")
        if len(excerpt) > 1000:
            raise Exception("Excerpt must be under 1000 characters")
        if not claim or len(claim) > 500:
            raise Exception("Claim must be 1-500 characters")
        if evidence_id in self.evidence:
            raise Exception("Evidence ID already exists")

        self.evidence[evidence_id] = {
            "evidence_id": evidence_id,
            "case_id": case_id,
            "submitter": self.contract_runner.from_address,
            "evidence_type": evidence_type,
            "title": title,
            "content_ref": content_ref[:500] if content_ref else "",
            "excerpt": excerpt[:1000] if excerpt else "",
            "claim": claim,
            "submitted_at_note": submitted_at_note[:200] if submitted_at_note else "",
        }
        case["evidence_count"] += 1
        if case["status"] == "OPEN":
            case["status"] = "EVIDENCE_SUBMITTED"
        return evidence_id

    async def request_review(self, case_id: str) -> str:
        if case_id not in self.cases:
            raise Exception("Case not found")
        case = self.cases[case_id]
        if case["evidence_count"] < 1:
            raise Exception("No evidence submitted")
        if case["status"] == "REVIEW_PENDING":
            raise Exception("Review already pending")

        case["status"] = "REVIEW_PENDING"

        case_evidence = []
        for ev_id, ev in self.evidence.items():
            if ev["case_id"] == case_id:
                case_evidence.append(ev)

        evidence_packet = ""
        for ev in case_evidence:
            evidence_packet += (
                f"[{ev['evidence_id']}] Type: {ev['evidence_type']}, "
                f"Submitted by: {ev['submitter']}, "
                f"Title: {ev['title']}, "
                f"Ref: {ev['content_ref']}, "
                f"Excerpt: {ev['excerpt']}, "
                f"Claim: {ev['claim']}\n"
            )

        prompt = f"""You are reviewing an off-chain agreement dispute.

Your job is not to decide morality. Your job is to reconstruct the canonical agreement state from the evidence.

Case:
{case['title']} — {case['agreement_summary']}

Parties:
A: {case['party_a']}
B: {case['party_b']}

Evidence list:
{evidence_packet}

Rules:
1. Prefer explicit later agreement over earlier draft discussion.
2. Do not invent terms not supported by evidence.
3. Treat screenshots/links/excerpts as evidence references, not guaranteed truth.
4. If evidence conflicts and chronology is unclear, mark the term ambiguous.
5. If a term was initially included but later clearly removed, put it in changed_terms or excluded_terms.
6. Keep the output compact.
7. Return valid JSON only. No markdown, no explanation, just the JSON object.
8. Max 8 items per array. Max 96 chars per term. Max 240 chars for short_reason. Max 8 decisive_evidence_ids.

Return this exact JSON shape:
{{
  "verdict":"AGREEMENT_VERIFIED|PARTIAL_AGREEMENT|NO_AGREEMENT_FOUND|AGREEMENT_CHANGED|CONFLICT_UNRESOLVED|INSUFFICIENT_EVIDENCE",
  "agreement_state":"FULLY_CONFIRMED|PARTIALLY_CONFIRMED|CHANGED|UNCLEAR|NOT_FOUND",
  "confirmed_terms":["..."],
  "excluded_terms":["..."],
  "changed_terms":["..."],
  "ambiguous_terms":["..."],
  "prevailing_party":"party_a|party_b|mixed|none",
  "confidence":"LOW|MEDIUM|HIGH",
  "decisive_evidence_ids":["..."],
  "short_reason":"..."
}}"""

        final_result = await call_llm_with_principle(
            prompt,
            eq_principle="The result must have the same verdict, agreement_state, prevailing_party, and confidence. The confirmed_terms, excluded_terms, changed_terms, and ambiguous_terms must be semantically equivalent (same meaning, not necessarily identical wording). The decisive_evidence_ids must reference the same evidence items. The short_reason must convey the same meaning.",
        )

        case["final_verdict_json"] = final_result
        case["status"] = "VERDICT_ISSUED"
        return final_result

    def appeal(
        self,
        case_id: str,
        appeal_id: str,
        basis: str,
        argument: str,
        new_evidence_ref: str,
    ) -> str:
        if case_id not in self.cases:
            raise Exception("Case not found")
        case = self.cases[case_id]
        if case["status"] not in ("VERDICT_ISSUED", "APPEAL_RESOLVED"):
            raise Exception("Cannot appeal before verdict is issued")

        allowed_bases = [
            "NEW_EVIDENCE",
            "WRONG_INTERPRETATION",
            "MISSING_CONTRADICTION",
            "FORGED_EVIDENCE",
            "TIMELINE_MISREAD",
            "SCOPE_CHANGE_IGNORED",
        ]
        if basis not in allowed_bases:
            raise Exception(f"Appeal basis must be one of: {allowed_bases}")
        if not argument or len(argument) > 1000:
            raise Exception("Argument must be 1-1000 characters")
        if appeal_id in self.appeals:
            raise Exception("Appeal ID already exists")

        self.appeals[appeal_id] = {
            "appeal_id": appeal_id,
            "case_id": case_id,
            "appellant": self.contract_runner.from_address,
            "basis": basis,
            "argument": argument,
            "new_evidence_ref": new_evidence_ref[:500] if new_evidence_ref else "",
            "status": "PENDING",
            "result_json": "",
        }
        case["appeal_count"] += 1
        case["status"] = "APPEALED"
        return appeal_id

    def get_case(self, case_id: str) -> str:
        if case_id not in self.cases:
            raise Exception("Case not found")
        return json.dumps(self.cases[case_id])

    def get_evidence(self, evidence_id: str) -> str:
        if evidence_id not in self.evidence:
            raise Exception("Evidence not found")
        return json.dumps(self.evidence[evidence_id])

    def get_case_evidence_ids(self, case_id: str) -> str:
        ids = []
        for ev_id, ev in self.evidence.items():
            if ev["case_id"] == case_id:
                ids.append(ev_id)
        return json.dumps(ids)

    def get_verdict(self, case_id: str) -> str:
        if case_id not in self.cases:
            raise Exception("Case not found")
        return self.cases[case_id]["final_verdict_json"]

    def get_all_cases(self) -> str:
        return json.dumps(list(self.cases.values()))

    def get_appeal(self, appeal_id: str) -> str:
        if appeal_id not in self.appeals:
            raise Exception("Appeal not found")
        return json.dumps(self.appeals[appeal_id])

    def get_case_appeals(self, case_id: str) -> str:
        appeal_list = []
        for ap_id, ap in self.appeals.items():
            if ap["case_id"] == case_id:
                appeal_list.append(ap)
        return json.dumps(appeal_list)
