"""
WSGI config for jaaybaanbackend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from decouple import config

from django.core.wsgi import get_wsgi_application

# Dynamically select settings module based on ENV variable
if os.getenv("DJANGO_SETTINGS_MODULE") is None:
    env = config("ENV", "development")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", f"jaaybaanbackend.settings.{env}")

application = get_wsgi_application()
