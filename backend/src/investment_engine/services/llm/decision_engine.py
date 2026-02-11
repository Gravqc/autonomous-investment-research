from openai import OpenAI
from investment_engine.workflows.schemas.llm_models import DecisionResponse
from investment_engine.workflows.schemas.prompt_builder import build_prompts
from investment_engine.workflows.utils.parser_helper import extract_json
import json
import time

client = OpenAI()

ollama_client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama" # Dummy key req by OpenAI
)


class DecisionEngine:

    @staticmethod
    def generate(candidates):

        system_prompt, user_prompt = build_prompts(candidates)

        try:
            response = client.chat.completions.parse(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": system_prompt},  
                    {"role": "user", "content": user_prompt},
                ],
                response_format=DecisionResponse,
                temperature=0.2,
            )

            # parsed object directly available
            return response.choices[0].message.parsed

        except Exception as e:
            raise RuntimeError(f"Unexpected error in DecisionEngine: {e}") from e

    @staticmethod
    def generate_ollama(candidates, retries: int = 3):

        system_prompt, user_prompt = build_prompts(candidates)

        # FORCE JSON — extremely important for local models
        system_prompt = (
            system_prompt + 
            """
                Return ONLY raw JSON.
                Do NOT wrap it in quotes.
                Do NOT use markdown.
                Do NOT add commentary.
                Do NOT say "Here is the JSON".
            """
        )

        last_error = None

        for attempt in range(retries):
            try:
                response = ollama_client.chat.completions.create(
                    model="mistral",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.2,
                )

                content = response.choices[0].message.content

                parsed_dict = extract_json(content)

                return DecisionResponse.model_validate(parsed_dict)

            except Exception as e:
                last_error = str(e)
                time.sleep(1.5 ** attempt)
