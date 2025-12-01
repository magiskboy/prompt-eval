import os
import json
import asyncio
import sqlite3
import litellm
from redis.asyncio import ConnectionPool, Redis

from evaluator.eval import Evaluator, Result

litellm._turn_on_debug() #type:ignore
litellm.use_litellm_proxy = True

DB_FILE = os.getenv('DB_FILE', '/data/db.sqlite3')

async def main():
    print('Worker is starting...')

    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/1')
    redis_pool = ConnectionPool.from_url(redis_url)
    redis = Redis.from_pool(redis_pool)
    print(f'Connected to {redis_url}')

    with sqlite3.connect(DB_FILE) as db:
        print(f'Connected to {DB_FILE}')
        cursor = db.cursor()
        schema = """
        CREATE TABLE IF NOT EXISTS evaluation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            model TEXT NOT NULL,
            user_query TEXT NOT NULL,
            llm_response TEXT NOT NULL,

            human_clarity FLOAT NOT NULL,
            human_completeness FLOAT NOT NULL,
            human_specificity FLOAT NOT NULL,
            human_relevance FLOAT NOT NULL,
            human_safety FLOAT NOT NULL,
            human_structure FLOAT NOT NULL,
            human_format_compliance FLOAT NOT NULL,
            human_correctness FLOAT NOT NULL,

            llm_clarity FLOAT NOT NULL,
            llm_completeness FLOAT NOT NULL,
            llm_specificity FLOAT NOT NULL,
            llm_relevance FLOAT NOT NULL,
            llm_safety FLOAT NOT NULL,
            llm_structure FLOAT NOT NULL,
            llm_format_compliance FLOAT NOT NULL,
            llm_correctness FLOAT NOT NULL,

            created_at TEXT DEFAULT (datetime('now'))
        );
        """
        try:
            cursor.executescript(schema)
            db.commit()
        except Exception as e:
            print(e)
            db.rollback()

        while True:
            try:
                jobs = await redis.rpop('request', 1) #type:ignore
                if jobs and len(jobs) > 0:
                    parsed_job = json.loads(jobs[0].decode('utf-8')) #type:ignore
                    await process_job(parsed_job, db)

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(e)

            await asyncio.sleep(0.05)

        await redis.close(True)


async def process_job(job: dict, db: sqlite3.Connection):
    evaluator = Evaluator()
    session_id = job['request']['litellm_call_id']
    model = job['request']['model']
    user_query = job['request']['messages'][-1]['content']
    llm_response = job['response']['choices'][0]['content']
    print(f'Evaluating {job["request"]["litellm_call_id"]}...')
    result = await evaluator.evaluate(user_query, llm_response)
    print(f'Evaluated {job["request"]["litellm_call_id"]}...')
    insert_evaluation(session_id, model, user_query, llm_response, result, db)
   

def insert_evaluation(session_id: str, model: str, user_query: str, llm_response: str, result: Result, db: sqlite3.Connection):
    sql = """
        INSERT INTO evaluation (
            session_id,
            model,
            user_query,
            llm_response,

            human_clarity,
            human_completeness,
            human_specificity,
            human_relevance,
            human_safety,
            human_structure,
            human_format_compliance,
            human_correctness,

            llm_clarity,
            llm_completeness,
            llm_specificity,
            llm_relevance,
            llm_safety,
            llm_structure,
            llm_format_compliance,
            llm_correctness
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    params = (
        session_id,
        model,
        user_query,
        llm_response,

        result.human.clarity,
        result.human.completeness,
        result.human.specificity,
        result.human.relevance,
        result.human.safety,
        result.human.structure,
        result.human.format_compliance,
        result.human.correctness,

        result.llm.clarity,
        result.llm.completeness,
        result.llm.specificity,
        result.llm.relevance,
        result.llm.safety,
        result.llm.structure,
        result.llm.format_compliance,
        result.llm.correctness,
    )

    try:
        db.execute(sql, params)
        db.commit()
    except Exception as e:
        print(e)
        db.rollback()

if __name__ == '__main__':
    asyncio.run(main())

