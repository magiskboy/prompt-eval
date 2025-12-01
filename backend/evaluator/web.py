import os
from typing import Optional, Dict, Any
import sqlite3
from fastapi import FastAPI, Query, HTTPException
from starlette.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=True,
)

DB_FILE = os.getenv('DB_FILE', '/data/db.sqlite3')


@app.get('/health')
def health():
    return 'ok'


@app.get('/evals')
async def get_evals(
    user_query: Optional[str] = Query(None, description="Filter by user query"),
    llm_response: Optional[str] = Query(None, description="Filter by LLM response"),
    sort_field: Optional[str] = Query("id", description="Field to sort by"),
    sort_order: Optional[str] = Query("asc", description="asc or desc"),
    skip: int = 0,
    limit: int = 10,
):
    valid_sort_fields = [
        "human_clarity", "human_completeness", "human_specificity",
        "human_relevance", "human_safety", "human_structure",
        "human_format_compliance", "human_correctness",
        "llm_clarity", "llm_completeness", "llm_specificity",
        "llm_relevance", "llm_safety", "llm_structure",
        "llm_format_compliance", "llm_correctness",
        "id"
    ]

    if sort_field not in valid_sort_fields:
        raise HTTPException(status_code=400, detail=f"Invalid sort_field. Must be one of {valid_sort_fields}")

    if sort_order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="sort_order must be 'asc' or 'desc'")

    query = "SELECT * FROM evaluation WHERE 1=1"
    params = []

    if user_query:
        query += " AND user_query LIKE ?"
        params.append(f"%{user_query}%")
    if llm_response:
        query += " AND llm_response LIKE ?"
        params.append(f"%{llm_response}%")

    query += f" ORDER BY {sort_field} {sort_order.upper()}"
    query += " LIMIT ? OFFSET ?"
    params.extend([limit, skip])

    with sqlite3.connect(DB_FILE) as conn:
        try:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [row_to_dict(cursor, row) for row in rows]
        except sqlite3.Error as e:
            raise HTTPException(status_code=500, detail=str(e))


def row_to_dict(cursor: sqlite3.Cursor, row: sqlite3.Row) -> Dict[str, Any]:
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

