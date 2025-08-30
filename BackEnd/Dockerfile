
FROM python:3.13-slim

# Set workdir
WORKDIR /app

# Install uv
RUN python -m pip install --upgrade pip setuptools wheel
RUN python -m pip install uv

# Copy project files
COPY pyproject.toml .

# Install dependencies with uv
RUN uv sync

# Copy the rest of the Django project
COPY ./jaaybaanbackend .

ENV PATH="/app/.venv/bin:$PATH"

# Collect static files (optional)
# RUN python manage.py collectstatic --noinput

# Expose Django port
EXPOSE 8000

# Run Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
