from pydantic import BaseModel
from evaluator.human_eval import HumanEvaluator
from evaluator.llm_eval import LLMEvaluator


class EvaluationResult(BaseModel):
    clarity: float
    completeness: float
    specificity: float
    relevance: float
    safety: float
    structure: float
    format_compliance: float
    correctness: float


class Result(BaseModel):
    human: EvaluationResult
    llm: EvaluationResult


class Evaluator:
    def __init__(self) -> None:
        self.human_evaluator = HumanEvaluator()
        self.llm_evaluator = LLMEvaluator()

    async def evaluate(self, query: str, response: str):
        human_eval = await self.human_evaluator.evaluate(query, response)
        llm_eval = await self.llm_evaluator.evaluate(query, response)
        result = {
            "human": human_eval,
            "llm": llm_eval,
        }

        return Result.model_validate(result)
