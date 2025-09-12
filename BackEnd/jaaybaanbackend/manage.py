#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

import os
import sys


def main():
    """Run administrative tasks."""
    # Use development settings by default for local development
    # Only use production settings if explicitly set via environment variable
    if os.getenv("DJANGO_SETTINGS_MODULE") is None:
        # Check if we're in a containerized environment (Docker)
        if os.path.exists("/.dockerenv") or os.getenv("DJANGO_ENV") == "production":
            os.environ.setdefault(
                "DJANGO_SETTINGS_MODULE", "jaaybaanbackend.settings_prod"
            )
        else:
            os.environ.setdefault("DJANGO_SETTINGS_MODULE", "jaaybaanbackend.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
