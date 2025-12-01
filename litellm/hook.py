import os
import json
from typing import Any, AsyncGenerator
from litellm.integrations.custom_logger import CustomLogger
from litellm.types.utils import ModelResponseStream
from litellm.proxy.proxy_server import UserAPIKeyAuth
from redis.asyncio import Redis, ConnectionPool


# https://docs.litellm.ai/docs/observability/custom_callback#callback-class
class SendToEvaluator(CustomLogger): 
    queue_name = 'request'
    redis: Redis

    def __init__(self):
        redis_host = os.getenv('REDIS_HOST', 'localhost')
        redis_port = os.getenv('REDIS_PORT', '6379')
        redis_url = f'redis://{redis_host}:{redis_port}/1'
        redis_pool = ConnectionPool.from_url(redis_url)
        self.redis = Redis.from_pool(redis_pool)

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response,
    ):
        payload = {
            "request": {
                "model": data['model'],
                'messages': data['messages'],
                'litellm_trace_id': data['litellm_trace_id'],
                'litellm_call_id': data['litellm_call_id'],
            },
            "response": json.loads(response.model_dump_json()), #type:ignore
        }
        await self.enqueue(payload)

    async def async_post_call_streaming_iterator_hook(self, user_api_key_dict: UserAPIKeyAuth, response: Any, request_data: dict) -> AsyncGenerator[ModelResponseStream, None]:
        chunks = []
        async for chunk in response:
            yield chunk

            if chunk.choices[0].delta.function_call or chunk.choices[0].delta.tool_calls or hasattr(chunk.choices[0].delta, 'reasoning_content'):
                continue
            
            chunks.append(chunk)

        chunks[-1].choices[0].content = ''
        for chunk in chunks[:-1]:
            content = chunk.choices[0].delta.content
            if content is not None:
                chunks[-1].choices[0].content += content

        payload = {
            "request": {
                "model": request_data['model'],
                'messages': request_data['messages'],
                'litellm_trace_id': request_data['litellm_trace_id'],
                'litellm_call_id': request_data['litellm_call_id'],
            },
            "response": json.loads(chunks[-1].model_dump_json())
        }
        await self.enqueue(payload)

    async def enqueue(self, payload: dict):
        await self.redis.lpush(self.queue_name, json.dumps(payload)) #type:ignore


send_to_evaluator = SendToEvaluator()
