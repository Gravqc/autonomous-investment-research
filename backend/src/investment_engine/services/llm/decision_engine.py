from openai import OpenAI
from investment_engine.workflows.schemas.llm_models import DecisionResponse
from investment_engine.workflows.schemas.prompt_builder import build_prompts

client = OpenAI()


class DecisionEngine:
    
    @staticmethod
    def generate(candidates):

        system_prompt, user_prompt = build_prompts(candidates)

        try:
            response = client.chat.completions.parse(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": system_prompt},  # <-- FIXED ORDER
                    {"role": "user", "content": user_prompt},
                ],
                response_format=DecisionResponse,
                temperature=0.2,
            )

            # parsed object directly available
            return response.choices[0].message.parsed

        except Exception as e:
            raise RuntimeError(f"Unexpected error in DecisionEngine: {e}") from e