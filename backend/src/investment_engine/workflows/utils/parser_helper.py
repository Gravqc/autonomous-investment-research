import json
import re


def extract_json(content: str) -> dict:
    """
    Extract the first valid JSON object from LLM output.
    Handles:
    - wrapped quotes
    - markdown blocks
    - prefixed text
    - trailing garbage
    """

    content = content.strip()

    # Remove markdown
    content = content.replace("```json", "").replace("```", "").strip()

    # Remove wrapping quotes
    if content.startswith(("'", '"')) and content.endswith(("'", '"')):
        content = content[1:-1]

    # 🔥 Find JSON via regex
    match = re.search(r"\{.*\}", content, re.DOTALL)

    if not match:
        raise ValueError("No JSON object found in response")

    json_str = match.group(0)

    return json.loads(json_str)
