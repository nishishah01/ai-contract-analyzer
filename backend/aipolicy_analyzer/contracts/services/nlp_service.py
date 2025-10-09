import google.generativeai as genai
import os, json, re
from django.conf import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

PROMPT_TEMPLATE = """
You are a contract analyzer.
Analyze the following text and return structured JSON with fields:
- clauses: list of {{text, risk (Low/Medium/High), explanation, rewrite}}
- overall_risk_score: integer (0-100)
- tags: relevant keywords

Contract Text:
{contract_text}

Return ONLY valid JSON. No markdown fences, no explanation, just JSON.
"""

def clean_json_output(raw_text: str):
    """Remove markdown fences and safely parse JSON."""
    cleaned = re.sub(r"```[a-zA-Z]*", "", raw_text).strip("` \n")
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None

def analyze_contract_with_gemini(text: str):
    model = genai.GenerativeModel("gemini-2.5-pro")
    prompt = PROMPT_TEMPLATE.format(contract_text=text)

    try:
        response = model.generate_content(prompt)

        # Get response text robustly
        raw_output = None
        if hasattr(response, "text") and response.text:
            raw_output = response.text
        elif response.candidates:
            raw_output = response.candidates[0].content.parts[0].text

        if not raw_output or not raw_output.strip():
            return {"error": "Model returned empty response."}

        # Clean & parse JSON
        structured = clean_json_output(raw_output)

        return {
            "raw_response": raw_output,
            "structured": structured if structured else {},
            "error": None if structured else "Invalid JSON from model."
        }

    except Exception as e:
        return {"error": str(e)}
