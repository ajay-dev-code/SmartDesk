import os
import json
import logging

from dotenv import load_dotenv
from google import genai

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)


def classify_ticket(subject: str, description: str):
    prompt = f"""
You are an AI assistant for a customer support ticket management system.

Analyze this support ticket.

Subject:
{subject}

Description:
{description}

Return ONLY valid JSON in exactly this format:

{{
    "category": "Technical",
    "priority": "High",
    "summary": "Short one-line summary of the issue"
}}

Rules:
- category must be exactly one of:
  Technical, Billing, Account, General
- priority must be exactly one of:
  Low, Medium, High
- summary must be a short one-line description.
- Do not include markdown.
- Do not include any additional text.
"""

    try:
        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=prompt
        )

        result_text = interaction.output_text.strip()

        result = json.loads(result_text)

        valid_categories = {
            "Technical",
            "Billing",
            "Account",
            "General"
        }

        valid_priorities = {
            "Low",
            "Medium",
            "High"
        }

        if (
            result.get("category") not in valid_categories
            or result.get("priority") not in valid_priorities
            or not result.get("summary")
        ):
            raise ValueError("Invalid AI response")

        return {
            "category": result["category"],
            "priority": result["priority"],
            "summary": result["summary"]
        }

    except Exception as e:
        logger.error("AI classification failed: %s", e)

        return {
            "category": "General",
            "priority": "Medium",
            "summary": None
        }