# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend-builder
WORKDIR /frontend

# Install Node dependencies with lockfile support for reproducible builds
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build frontend static assets
COPY frontend/ ./
RUN npm run build


FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS backend-builder
WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
	UV_LINK_MODE=copy

# Install Python dependencies from lockfile for deterministic environments
COPY backend-fastapi/pyproject.toml backend-fastapi/uv.lock ./
RUN uv sync --frozen --no-dev

# Copy backend source and frontend build output
COPY backend-fastapi/ ./
COPY --from=frontend-builder /frontend/dist ./dist


FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	UV_COMPILE_BYTECODE=1 \
	UV_LINK_MODE=copy \
	PATH="/app/.venv/bin:${PATH}" \
	VOLUMN_DIR="/db_share"

# Copy only what is needed at runtime
COPY --from=backend-builder /app/.venv /app/.venv
COPY --from=backend-builder /app/app ./app
COPY --from=backend-builder /app/main.py ./main.py
COPY --from=backend-builder /app/pyproject.toml ./pyproject.toml
COPY --from=backend-builder /app/uv.lock ./uv.lock
COPY --from=backend-builder /app/dist ./dist

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
