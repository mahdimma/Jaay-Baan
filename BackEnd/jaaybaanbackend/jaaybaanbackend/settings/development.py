from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY", default="django-insecure-dev-key")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default=["*"]).split(",")

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="jaaybaan_db"),
        "USER": config("DB_USER", default="postgres"),
        "PASSWORD": config("DB_PASSWORD", default="password"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# Static files
STATIC_ROOT = BASE_DIR / "static"

# Media files
MEDIA_ROOT = BASE_DIR / "media"

# CORS settings for frontend communication
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # React default
    "http://127.0.0.1:5173",
    "http://localhost:8080",  # Vue default
    "http://127.0.0.1:8080",
]


CORS_ALLOW_CREDENTIALS = True
