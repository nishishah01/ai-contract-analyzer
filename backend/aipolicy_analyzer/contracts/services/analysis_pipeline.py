# contracts/services/analysis_pipeline.py
import hashlib
import difflib
import json
import re
from datetime import datetime

# local imports (same package)
from .nlp_service import analyze_contract_with_gemini
from ..models import Document, AnalysisCache

# -------------------------
# Helpers: checksum, cleaning
# -------------------------
def compute_checksum(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def split_into_clauses(text):
    # Split text into clauses by numbering or "Section" headings
    parts = re.split(
        r"\n\d+\.\s+|\n\d+\)\s+|section\s+\d+[:.\s]+",
        text,
        flags=re.IGNORECASE
    )
    clauses = [p.strip() for p in parts if p.strip()]
    return clauses

def chunk_clauses(clauses, max_words=1500):
    """
    Group clauses into chunks under ~max_words words to avoid token limit.
    """
    chunks, current, count = [], [], 0
    for clause in clauses:
        w = len(clause.split())
        if count + w > max_words and current:
            chunks.append("\n\n".join(current))
            current, count = [], 0
        current.append(clause)
        count += w
    if current:
        chunks.append("\n\n".join(current))
    return chunks

# -------------------------
# Heuristic risk scoring
# -------------------------
RISK_KEYWORDS = {
    "non-compete": "High",
    "non compete": "High",
    "non-compete clause": "High",
    "penalty": "High",
    "forfeit": "High",
    "terminate": "High",
    "termination": "High",
    "indemnif": "High",
    "confidential": "Medium",
    "privacy": "Medium",
    "data protection": "Medium",
    "intellectual property": "Medium",
}

RISK_LEVELS = {"Low": 1, "Medium": 2, "High": 3}

def heuristic_risk(clause_text: str, llm_risk: str = None) -> str:
    """
    Combine LLM risk (if present) and keyword heuristic to produce final label.
    """
    score = RISK_LEVELS.get((llm_risk or "Low").title(), 1)
    lower = clause_text.lower()
    for kw, level in RISK_KEYWORDS.items():
        if kw in lower:
            score = max(score, RISK_LEVELS[level])
    # convert back
    for label, val in RISK_LEVELS.items():
        if val == score:
            return label
    return "Low"

# -------------------------
# Industry tagging
# -------------------------
INDUSTRY_KEYWORDS = {
    "Healthcare": ["hipaa", "patient", "medical", "healthcare", "hospital"],
    "Finance": ["gdpr", "ccpa", "financial", "bank", "securities", "payment"],
    "Technology": ["source code", "software", "api", "technology", "intellectual property"],
    "Employment": ["employee", "employment", "non-compete", "compensation", "salary"],
}

def detect_industries(text: str):
    found = set()
    lower = text.lower()
    for industry, kws in INDUSTRY_KEYWORDS.items():
        for kw in kws:
            if kw in lower:
                found.add(industry)
    return list(found) if found else ["General"]

# -------------------------
# Diffing/version comparison
# -------------------------
def compute_diff(old_text: str, new_text: str) -> str:
    diff = difflib.unified_diff(
        old_text.splitlines(),
        new_text.splitlines(),
        lineterm=""
    )
    return "\n".join(diff)

# -------------------------
# Main pipeline
# -------------------------
def run_analysis_pipeline(document: Document, force_reanalyze: bool = False) -> dict:
    """
    Orchestrates the analysis:
      - compute checksum and check cache
      - split & chunk
      - call LLM per chunk
      - merge results, apply heuristics & tags
      - check versioning (previous doc with same owner+file name)
      - store cache & update document.analysis
    Returns final structured dict.
    """

    text = (document.text_content or "").strip()
    if not text:
        return {"error": "empty_text", "message": "Document has no extracted text."}

    checksum = compute_checksum(text)

    # 1) cache hit?
    if not force_reanalyze:
        cached = AnalysisCache.objects.filter(file_hash=checksum).first()
        if cached:
            # attach to document.analysis and return cached
            try:
                doc_result = cached.result_json
                document.analysis = doc_result
                document.save(update_fields=["analysis"])
                return doc_result
            except Exception:
                # if something odd happens, continue to reanalyze
                pass

    # 2) split & chunk
    clauses = split_into_clauses(text)
    chunks = chunk_clauses(clauses, max_words=1200)

    merged_clauses = []
    raw_responses = []

    # 3) call LLM for each chunk
    for chunk in chunks:
        llm_out = analyze_contract_with_gemini(chunk)
        raw_responses.append(llm_out)
        # llm_out expected to be dict with "clauses" list; but we handle other shapes.
        if isinstance(llm_out, dict) and llm_out.get("structured"):
            llm_out = llm_out["structured"]
        if not isinstance(llm_out, dict):
            continue
        for c in llm_out.get("clauses", []):
            text_c = c.get("text", "").strip()
            llm_risk = c.get("risk") or c.get("severity") or "Low"
            final_risk = heuristic_risk(text_c, llm_risk)
            merged_clauses.append({
                "text": text_c,
                "risk": final_risk,
                "explanation": c.get("explanation") or c.get("explain") or "",
                "rewrite": c.get("rewrite") or c.get("suggested_rewrite") or "",
                "source_llm": c,
            })

    # 4) compute overall risk score (normalized 0-100)
    if merged_clauses:
        total = sum(RISK_LEVELS.get(c["risk"], 1) for c in merged_clauses)
        avg = total / len(merged_clauses)
        overall_risk_score = int(((avg - 1) / (max(RISK_LEVELS.values()) - 1)) * 100) if len(RISK_LEVELS) > 1 else 0
    else:
        overall_risk_score = 0

    # 5) industry tags
    industries = detect_industries(text)

    # 6) versioning: find latest previous doc for owner with same file name (or you can use other logic)
    previous = Document.objects.filter(owner=document.owner).exclude(id=document.id).order_by("-uploaded_at").first()
    diff_summary = None
    if previous and previous.text_content:
        diff_summary = compute_diff(previous.text_content, text)

    result = {
        "clauses": merged_clauses,
        "overall_risk_score": overall_risk_score,
        "tags": industries,
        "diff_summary": diff_summary,
        "cache_hash": checksum,
        "raw_responses": raw_responses,
        "analyzed_at": datetime.utcnow().isoformat(),
    }

    # 7) persist cache and attach to document.analysis
    try:
        AnalysisCache.objects.update_or_create(
            file_hash=checksum,
            defaults={"result_json": result}
        )
    except Exception:
        # swallow cache write errors, not fatal
        pass

    document.analysis = result
    document.save(update_fields=["analysis"])

    return result
