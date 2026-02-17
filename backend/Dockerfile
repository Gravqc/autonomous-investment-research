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

# Install dependencies (only production dependencies)
RUN poetry install --no-interaction --no-root

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Set Python path so imports work correctly
ENV PYTHONPATH=/app/src

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port (Railway will override this with $PORT)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the application
CMD ["uvicorn", "investment_engine.main:app", "--host", "0.0.0.0", "--port", "8000"]