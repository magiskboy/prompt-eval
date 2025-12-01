import json
from litellm import acompletion


class LLMEvaluator:
    async def evaluate(self, query: str, response: str):
        messages = [
            {
                'role': 'user',
                'content': f'''
                You are a prompt evaluator.
                Evaluate the following:
                - User prompt: {query}
                - Model response: {response}

                Scoring includes:
                Clarity: 1-5
                Completeness: 1-5
                Specificity: 1-5
                Relevance: 1-5
                Safety: 1-5
                Structure: 1-5
                Format compliance: 1-5
                Correctness: 1-5

                Return your evaluation **strictly** in JSON format like this:
                {{
                    "clarity": int,
                    "completeness": int,
                    "specificity": int,
                    "relevance": int,
                    "safety": int
                    "structure": 0,
                    "format_compliance": 0,
                    "correctness": 0,
                }}
                Do not include any text outside this JSON.
                '''
            }
        ]

        result = await acompletion(
            model='litellm_proxy/openai/gpt-oss-20b',
            messages=messages,
            stream=False,
            max_completion_tokens=16000,
            use_litellm_proxy=True,
        )

        raw = result.choices[0].message.content #type:ignore
        if (raw):
            return json.loads(raw)

        return {
            "clarity": 0,
            "completeness": 0,
            "specificity": 0,
            "relevance": 0,
            "safety": 0,
            "structure": 0,
            "format_compliance": 0,
            "correctness": 0,
        }

