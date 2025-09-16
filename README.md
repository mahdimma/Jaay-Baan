# Jaay-Baan

Jaay-Baan is a local-first, production-ready inventory management system for physical items, designed for personal and small business use. It features a modern React frontend, a robust Django backend, and a PostgreSQL database, all containerized for easy deployment and maintenance.

---

## Table of Contents

- Features
- Architecture
- Quick Start
- Manual Backend Setup
- Frontend Development
- API Overview
- Authentication
- Locations API
- Images & Media
- Statistics & Search
- Bulk Operations
- Data Management
- Deployment & Management
- Performance
- Security
- Customization
- Monitoring & Troubleshooting
- Scaling & Contributing
- License

---

## Features

- **Hierarchical location management**: Organize items in nested containers (house, room, shelf, item, etc.)
- **Barcode support**: Track items and locations with barcodes
- **Image uploads**: Attach images to locations and items
- **Cleaning tracking**: Record cleaning times and durations
- **Statistics dashboard**: View system-wide stats and breakdowns
- **Bulk operations**: Move, delete, and update multiple items at once
- **Mobile-responsive UI**: Persian-friendly, works well on phones and tablets
- **Production-ready deployment**: Secure, optimized Docker containers with daily backups

---

## Architecture

```
┌─────────────────────────┐
│     React Frontend      │  ← Pre-built from GitHub releases
│    (served by Django)   │
├─────────────────────────┤
│    Django Backend       │  ← API + Static file serving
│   (Gunicorn + WhiteNoise)│
├─────────────────────────┤
│   PostgreSQL Database   │  ← DataBase
│    (with daily backups) │
└─────────────────────────┘
```

- **Frontend**: FrontEnd (React + Vite + Tailwind)
- **Backend**: jaaybaanbackend (Django REST Framework)
- **Database**: PostgreSQL, containerized, with persistent volumes and automated backups

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### One-Command Installation

```bash
git clone https://github.com/mahdimma/Jaay-Baan.git
cd Jaay-Baan
chmod +x install.sh
./install.sh
```

The installer will:

- Download the latest frontend build
- Set up production configs
- Build and start all containers
- Initialize the database and sample data
- Configure daily backups

### Access

- **App**: http://localhost:8000, http://{local_ip}:8000
- **Admin**: http://localhost:8000/admin (default: admin/admin123)

---

## Manual Backend Setup

For development or advanced users:

### Prerequisites

- Python 3.13+
- PostgreSQL
- [uv](https://github.com/astral-sh/uv) (dependency manager)

### Steps

```bash
cd BackEnd
uv sync
cp .env.example .env  # Edit .env for your environment
uv run python jaaybaanbackend/manage.py migrate
uv run python jaaybaanbackend/manage.py createsuperuser
uv run python jaaybaanbackend/manage.py create_sample_data  # Optional
uv run python jaaybaanbackend/manage.py runserver
```

---

## Frontend Development

- Located in FrontEnd
- Built with React, Vite, and Tailwind CSS
- For local development: `npm install && npm run dev`
- Production builds are served by Django via WhiteNoise

---

## API Overview

See API_DOCS.md for full details.

### Authentication

- All endpoints require token authentication (except login).
- Obtain token via `POST /api/v1/auth/login/`
- Use token in `Authorization: Token <your_token>` header.

### Locations API

- **List locations**: `GET /api/v1/locations/`
- **Create location**: `POST /api/v1/locations/`
- **Get details**: `GET /api/v1/locations/{id}/`
- **Edit location**: `PUT` (full) or `PATCH` (partial)
- **Delete location**: `DELETE /api/v1/locations/{id}/`
- **Tree structure**: `GET /api/v1/locations/tree/`
- **Breadcrumb**: `GET /api/v1/locations/{id}/breadcrumb/`

#### Example Location Object

```json
{
  "id": 5,
  "name": "اتاق خواب اصلی",
  "location_type": "room",
  "description": "اتاق خواب بزرگ با کمد دیواری",
  "is_container": true,
  "barcode": "ROOM_001",
  "quantity": 1,
  "value": 500000,
  "cleaned_time": "2025-01-01T10:00:00Z",
  "cleaned_duration": 45,
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T12:30:00Z",
  "breadcrumb": "خانه من > اتاق خواب اصلی",
  "children_count": 0,
  "needs_cleaning": false,
  "images": []
}
```

---

## Images & Media

- Images are stored in `/media/location_images/` and `/media/item_images/`
- Upload via API endpoints
- Media files are persisted in Docker volumes

---

## Statistics & Search

- **Statistics**: `GET /api/v1/locations/statistics/`
- **Search & Filtering**: Query parameters for parent, type, pagination, etc.

---

## Bulk Operations

- Move, delete, and update multiple locations/items via dedicated endpoints.

---

## Data Management

- **Database**: Docker volume `postgres_data`
- **Media**: Docker volume `media_data`
- **Backups**: `./backups/` (daily, 30-day retention)
- **Restore**: See DEPLOYMENT.md for recovery procedures

---

## Deployment & Management

### Management Commands

- View status: `docker-compose -f docker-compose.prod.yml ps`
- View logs: `docker-compose -f docker-compose.prod.yml logs`
- Restart: `docker-compose -f docker-compose.prod.yml restart`
- Stop: `docker-compose -f docker-compose.prod.yml down`
- Start: `docker-compose -f docker-compose.prod.yml up -d`
- Database shell: `docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d jaaybaan_db`
- Manual backup: `docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres jaaybaan_db > manual_backup.sql`
- Restore: `docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d jaaybaan_db < backup.sql`
- Update: `git pull && ./install.sh`

---

## Performance

- Indexed fields for fast queries
- Connection pooling and caching
- Optimized for hierarchical data (10k+ locations)
- Gunicorn with multiple workers
- Static file compression and caching

---

## Security

- Runs as non-root user in containers
- Minimal runtime dependencies
- Secure secret key generation
- CORS configured for local network
- Database credentials auto-generated
- Daily vulnerability scanning (Trivy, Docker Scout)
- File permissions and .dockerignore for sensitive files
- Multi-stage Docker builds for minimal image size
- Security hardening: AppArmor, SELinux, CIS/NIST compliance

---

## Customization

- Edit .env for environment variables
- Modify `docker-compose.prod.yml` for ports, resources, volumes, networks

---

## Monitoring & Troubleshooting

- Health checks: `curl http://localhost:8000/health/`
- Database health: `docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres`
- Real-time logs: `docker-compose -f docker-compose.prod.yml logs -f web`
- Error logs: `docker-compose -f docker-compose.prod.yml logs web | grep ERROR`
- Common issues and recovery: See DEPLOYMENT.md

---

## Scaling & Contributing

- Tune database and Gunicorn workers in `docker-compose.prod.yml`
- For development: use FrontEnd and BackEnd directly
- Submit pull requests via GitHub
- Frontend builds automated via GitHub Actions

---

## License

See the main LICENSE file for details.

---

**🏠 Jaay-Baan**: Your personal, local-first inventory management system.
**Persian-friendly • Mobile-responsive • Production-ready**
