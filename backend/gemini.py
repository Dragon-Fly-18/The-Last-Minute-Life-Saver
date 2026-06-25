import os
from dotenv import load_dotenv
from google import genai


load_dotenv()


client = genai.Client(
    api_key=os.getenv("gemini_api_key")
)


def ask_gemini(prompt):

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        print(response)
        return response.text

    except Exception as e:
        print(f"[Gemini Error] {e}")
        return f"Error: {e}"


def ask_gemini_json(prompt):
    """Call Gemini with structured JSON output mode."""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            },
        )
        return response.text

    except Exception as e:
        print(f"[Gemini JSON Error] {e}")
        return None