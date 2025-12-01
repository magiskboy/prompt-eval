FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./

ENV UV_COMPILE_BYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN uv sync

COPY . .

EXPOSE 8000

ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

CMD ["fastapi", "run", "evaluator/web.py"]

