# Jaay-Baan Backend

This is the backend service for Jaay-Baan, a local-first inventory management system. It is built with Django and Django REST Framework, optimized for containerized deployment, and designed to serve a React frontend and a RESTful API for managing hierarchical locations and items.

---

## Features

- **Hierarchical location management** (house, room, shelf, item, etc.)
- **Token-based authentication** (DRF)
- **Barcode support**
- **Image uploads for locations/items**
- **Cleaning tracking**
- **Statistics and bulk operations**
- **Persian-friendly, mobile-ready API**
- **Production-ready Docker setup**
- **Automated daily backups**

---

## Project Structure

```
BackEnd/
├── jaaybaanbackend/         # Django project root
│   ├── manage.py
│   ├── jaaybaanbackend/     # Django settings, URLs
│   ├── authentication/      # Auth app (token-based)
│   ├── locations/           # Location/item management
│   └── media/               # Uploaded images
├── API_DOCS.md              # Full API documentation
├── Dockerfile               # Optimized multi-stage build
├── Dockerfile.system-deps   # System dependencies
├── pyproject.toml           # Python dependencies
├── start.sh                 # Entrypoint script
├── .env.example             # Example environment config
└── README.md                # (You are here)
```

---

## Setup & Installation

### Prerequisites

- Python 3.13+
- PostgreSQL
- [uv](https://github.com/astral-sh/uv) (recommended for dependency management)

### Local Development

```bash
cd BackEnd
uv sync
cp .env.example .env  # Edit .env for your environment
uv run python jaaybaanbackend/manage.py migrate
uv run python jaaybaanbackend/manage.py createsuperuser
uv run python jaaybaanbackend/manage.py create_sample_data  # Optional
uv run python jaaybaanbackend/manage.py runserver
```

### Containerized Deployment

See the main project DEPLOYMENT.md for full instructions. The backend is designed to run in Docker, with production settings, optimized images, and daily backups.

---

## API Overview

See API_DOCS.md for full details.

- **Authentication**: Token-based, via `/api/v1/auth/login/`
- **Locations**: CRUD, tree structure, breadcrumbs, bulk operations
- **Images**: Upload and retrieve for locations/items
- **Statistics**: System-wide stats endpoint
- **Bulk Operations**: Move, delete, update multiple items

All endpoints (except login) require authentication.

---

## Environment Variables

Configure via `.env` or Docker Compose:

- `DB_*`: Database connection
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `SUPERUSER_*`: Initial admin credentials
- `CORS_ALLOWED_ORIGINS`: Frontend access

---

## Docker & Production

- Multi-stage Dockerfile for minimal image size
- Runs as non-root user (`app`)
- Health checks and resource limits
- Daily automated backups (see install.sh)
- Secure file permissions and `.dockerignore`

---

## Security

- Non-root container execution
- Minimal runtime dependencies
- Secure secret key and credentials
- CORS and session security
- Regular vulnerability scanning (Trivy, Docker Scout)
- AppArmor/SELinux profiles, CIS/NIST compliance

---

## Management & Operations

- View logs, restart, backup, restore via Docker Compose
- Health check endpoint: `/health/`
- Media and database stored in persistent Docker volumes

---

## Contributing

- Fork and clone the repo
- Use local development setup for changes
- Submit pull requests via GitHub

---

## License

See the main project LICENSE file.

---

**Jaay-Baan Backend**: Secure, scalable, and ready for production.
