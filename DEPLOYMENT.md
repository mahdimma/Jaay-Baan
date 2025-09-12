# Jaay-Baan - Containerized Deployment

Transform your physical item storage management system into a local-first, production-ready application.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)
- 4GB+ RAM recommended
- 10GB+ free disk space

### One-Command Installation

```bash
git clone https://github.com/mahdimma/Jaay-Baan.git
cd Jaay-Baan
chmod +x install.sh
./install.sh
```

That's it! 🎉

### What the installer does:

1. ✅ Downloads the latest frontend build from GitHub releases
2. ✅ Creates production environment configuration
3. ✅ Sets up PostgreSQL database with optimization
4. ✅ Builds and starts all services in containers
5. ✅ Creates sample data for immediate use
6. ✅ Configures automated daily backups

## 📱 Access Your Application

After installation, access Jaay-Baan at:

- **Local device**: http://localhost:8000
- **Other devices**: http://[YOUR-LOCAL-IP]:8000
- **Admin panel**: http://localhost:8000/admin (admin/admin123)

## 🔧 Management Commands

### Basic Operations

```bash
# View service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs web
docker-compose -f docker-compose.prod.yml logs db

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### Database Operations

```bash
# Access database shell
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d jaaybaan_db

# Create manual backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres jaaybaan_db > manual_backup.sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d jaaybaan_db < backup.sql
```

### Application Updates

```bash
# Update to latest version
git pull
./install.sh
```

## 💾 Data Management

### Persistent Data

- **Database**: Stored in Docker volume `postgres_data`
- **Media files**: Stored in Docker volume `media_data`
- **Backups**: Stored in `./backups/` directory (30-day rotation)

### Backup Strategy

- **Automatic**: Daily backups at midnight with 30-day retention
- **Manual**: Run backup commands as shown above
- **Recovery**: Restore from any backup file in `./backups/`

## 🏗️ Architecture

```
┌─────────────────────────┐
│     React Frontend      │  ← Pre-built from GitHub releases
│    (served by Django)   │
├─────────────────────────┤
│    Django Backend       │  ← API + Static file serving
│   (Gunicorn + WhiteNoise)│
├─────────────────────────┤
│   PostgreSQL Database   │  ← Optimized for 10k+ nodes
│    (with daily backups) │
└─────────────────────────┘
```

## ⚡ Performance Features

### Database Optimizations

- Indexed fields for fast queries on large datasets
- Connection pooling and caching
- Optimized for hierarchical data (10k+ locations)

### Application Optimizations

- Pre-built frontend served by WhiteNoise
- Gunicorn with multiple workers
- PostgreSQL tuned for local deployment
- Static file compression and caching

## 🔒 Security

### Production Settings

- Debug mode disabled
- Secure secret key generation
- CORS configured for local network access
- Database credentials auto-generated

### Network Access

- Backend accessible on local network (0.0.0.0:8000)
- Database restricted to localhost (127.0.0.1:5432)
- All communication over HTTP (suitable for local deployment)

## 🛠️ Customization

### Environment Variables

Edit `BackEnd/.env` to customize:

```bash
# Example configurations
DEBUG=False
ALLOWED_HOSTS=*
DB_PASSWORD=your-secure-password
CORS_ALLOWED_ORIGINS=http://your-custom-domain:8000
```

### Docker Configuration

Modify `docker-compose.prod.yml` for:

- Port changes
- Resource limits
- Volume mounting
- Network configuration

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8000/health/

# Database health
docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres
```

### Log Analysis

```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f web

# Error logs only
docker-compose -f docker-compose.prod.yml logs web | grep ERROR
```

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**

```bash
# Check Docker daemon
docker info

# Check for port conflicts
netstat -tlnp | grep :8000
netstat -tlnp | grep :5432
```

**Database connection issues:**

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Restart database
docker-compose -f docker-compose.prod.yml restart db
```

**Frontend not loading:**

```bash
# Check if frontend files exist
ls -la BackEnd/jaaybaanbackend/static/

# Rebuild frontend
rm -rf BackEnd/jaaybaanbackend/static/*
./install.sh
```

### Recovery Procedures

**Complete reset:**

```bash
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
./install.sh
```

**Restore from backup:**

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Start only database
docker-compose -f docker-compose.prod.yml up -d db

# Wait for database to be ready
sleep 30

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres -d jaaybaan_db < backups/backup_YYYYMMDD_HHMMSS.sql

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Scaling Considerations

### Resource Requirements

- **Minimum**: 2GB RAM, 2 CPU cores, 10GB storage
- **Recommended**: 4GB RAM, 4 CPU cores, 50GB storage
- **Large datasets (50k+ items)**: 8GB RAM, 6 CPU cores, 100GB storage

### Performance Tuning

For larger datasets, edit `docker-compose.prod.yml`:

```yaml
services:
  db:
    command: >
      postgres
      -c shared_buffers=512MB          # Increase for more RAM
      -c effective_cache_size=2GB      # Set to ~75% of available RAM
      -c work_mem=16MB                 # Increase for complex queries

  web:
    environment:
      - GUNICORN_WORKERS=6 # workers = (2 × CPU cores) + 1
```

## 🤝 Contributing

This deployment setup is designed for local-first usage. For development:

1. Use the original development setup in `FrontEnd/` and `BackEnd/`
2. Test changes locally
3. Submit pull requests
4. Frontend builds are automatically created via GitHub Actions

## 📄 License

See the main project LICENSE file for details.

---

**🏠 Jaay-Baan**: Your personal, local-first inventory management system.
**Persian-friendly • Mobile-responsive • Production-ready**
