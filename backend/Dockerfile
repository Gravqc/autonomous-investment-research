# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for some Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy poetry configuration files
COPY pyproject.toml poetry.lock ./

# Configure poetry: don't create virtual env since we're in a container
RUN poetry config virtualenvs.create false

# Install dependencies (include dev dependencies for now to avoid issues)
RUN poetry install --no-interaction --no-ansi

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Set Python path so imports work correctly
ENV PYTHONPATH=/app/src

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port - Railway uses $PORT environment variable
EXPOSE 8000

# Run the application - use Railway's PORT variable (JSON array format for proper signal handling)
CMD ["sh", "-c", "uvicorn investment_engine.main:app --host 0.0.0.0 --port ${PORT:-8000}"]