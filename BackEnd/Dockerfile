# Multi-stage build for production optimization
FROM python:3.12-slim as builder

# Copy uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install system dependencies needed for building
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configure uv for optimal Docker builds
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy dependency files for dependency installation layer
COPY pyproject.toml uv.lock ./

# Install dependencies first (separate layer for better caching)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project --no-dev

# Copy the project source code
COPY jaaybaanbackend/ ./jaaybaanbackend/

# Install the project itself in non-editable mode for production
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-editable

# Production stage - use slim Python image for smaller size
FROM python:3.12-slim as runtime

# Install runtime dependencies with latest security patches
RUN apt-get update && apt-get install -y \
    postgresql-client \
    ca-certificates \
    && apt-get upgrade -y \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/log/*

# Create app user for security and set up working directory
RUN groupadd -r app && useradd -r -g app app

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder --chown=app:app /app/.venv /app/.venv

# Copy the Django project code
COPY --from=builder --chown=app:app /app/jaaybaanbackend /app/jaaybaanbackend

# Copy start script
COPY --chown=app:app start.sh /app/start.sh

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Security: Prevent privilege escalation and limit system calls
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONHASHSEED=random

# Create necessary directories, set permissions, and make start script executable in one layer
RUN mkdir -p media static logs && \
    chown -R app:app /app && \
    chmod -R 755 /app && \
    chmod -R 750 /app/media /app/static /app/logs && \
    chmod +x /app/start.sh

# Switch to app user
USER app

EXPOSE 8000

# Health check using Python instead of curl for better security
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/', timeout=5)" || exit 1

CMD ["/app/start.sh"]
