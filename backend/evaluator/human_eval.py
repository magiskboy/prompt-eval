from litellm import aembedding
from scipy.spatial.distance import cosine

class HumanEvaluator:
    async def evaluate(self, query: str, response: str):
        embedding_distance = await self.distance_embeddings(query, response)

        return {
            "clarity": 0,
            "completeness": 0,
            "specificity": 0,
            "relevance": embedding_distance * 5,
            "safety": 0,
            "structure": 0,
            "format_compliance": 0,
            "correctness": 0,
        }

    async def distance_embeddings(self, query: str, response: str):
        try:
            result = await aembedding(
                model='litellm_proxy/jinaai/jina-code-embeddings-1.5b',
                input=[query, response],
                use_litellm_proxy=True,
            )
        except Exception as e:
            print(e)
            raise e
        return cosine(result.data[0]['embedding'], result.data[1]['embedding'])

