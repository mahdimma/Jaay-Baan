#!/bin/bash
# install.sh - One-click installer for Jaay-Baan
# Compatible with: Linux (all distros), macOS, Windows (WSL2)

set -e

echo "🏠 Installing Jaay-Baan - Physical Item Storage System"
echo "=================================================="

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

echo "🔍 Detected OS: $OS"

# Check Docker
echo "🐳 Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker not found!"
    case $OS in
        "linux")
            echo "   Install: curl -fsSL https://get.docker.com | sh"
            ;;
        "macos")
            echo "   Install: Download Docker Desktop from https://docker.com"
            ;;
        "windows")
            echo "   Install: Download Docker Desktop from https://docker.com"
            echo "   Or use WSL2 with Docker Desktop"
            ;;
        *)
            echo "   Visit: https://docker.com for installation instructions"
            ;;
    esac
    exit 1
fi

# Check Docker Compose (try both new and old syntax)
echo "🔧 Checking Docker Compose..."
DOCKER_COMPOSE_CMD=""
if command -v "docker compose" >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo "✅ Using Docker Compose V2 (docker compose)"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo "✅ Using Docker Compose V1 (docker-compose)"
else
    echo "❌ Docker Compose not found!"
    case $OS in
        "linux")
            echo "   Install V2: Usually included with Docker"
            echo "   Install V1: curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
            ;;
        "macos"|"windows")
            echo "   Docker Compose should be included with Docker Desktop"
            echo "   Try restarting Docker Desktop"
            ;;
    esac
    exit 1
fi

# Ensure a stable Compose project name across invocations (docker/podman compatibility)
PROJECT_NAME=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
export COMPOSE_PROJECT_NAME="$PROJECT_NAME"
echo "🧩 Using Compose project: $COMPOSE_PROJECT_NAME"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker dependencies verified"

# Build system dependencies base image if it doesn't exist
echo "🔧 Checking system dependencies base image..."
if ! docker image inspect jaay-baan-system-deps:builder >/dev/null 2>&1 || ! docker image inspect jaay-baan-system-deps:runtime >/dev/null 2>&1; then
    echo "📦 Building system dependencies base images..."
    echo "This may take a few minutes on first run..."
    
    # Build the multi-stage system dependencies image
    if docker build -f BackEnd/Dockerfile.system-deps --target builder -t jaay-baan-system-deps:builder BackEnd/; then
        echo "✅ Built jaay-baan-system-deps:builder"
    else
        echo "❌ Failed to build system dependencies builder image"
        exit 1
    fi
    
    if docker build -f BackEnd/Dockerfile.system-deps --target runtime -t jaay-baan-system-deps:runtime BackEnd/; then
        echo "✅ Built jaay-baan-system-deps:runtime"
    else
        echo "❌ Failed to build system dependencies runtime image"
        exit 1
    fi
    
    echo "✅ System dependencies base images built successfully"
else
    echo "✅ System dependencies base images already exist"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p BackEnd/jaaybaanbackend/locations/static/frontend/
mkdir -p backups
mkdir -p data/postgres
mkdir -p data/media

# Download latest frontend build
echo "📦 Downloading latest frontend build..."

# Check if frontend static files already exist
if [ -d "BackEnd/jaaybaanbackend/locations/static/frontend" ] && [ "$(ls -A BackEnd/jaaybaanbackend/locations/static/frontend 2>/dev/null)" ]; then
    echo "✅ Frontend static files already exist, skipping download/build"
    echo "   To force rebuild, delete BackEnd/jaaybaanbackend/locations/static/frontend/ directory"
else
    # Try different download methods based on availability
    DOWNLOAD_SUCCESS=false

    if command -v curl >/dev/null 2>&1; then
        echo "   Using curl..."
        if curl -L "https://github.com/mahdimma/Jaay-Baan/releases/latest/download/frontend-dist.zip" -o frontend-dist.zip 2>/dev/null; then
            # Validate that the downloaded file is actually a ZIP file
            if command -v file >/dev/null 2>&1; then
                if file frontend-dist.zip | grep -q "Zip archive\|ZIP archive"; then
                    DOWNLOAD_SUCCESS=true
                else
                    echo "⚠️  Downloaded file is not a valid ZIP archive"
                    rm -f frontend-dist.zip
                fi
            else
                # Fallback: check if it's a binary file by looking for ZIP signature
                if head -c 4 frontend-dist.zip 2>/dev/null | grep -q "PK"; then
                    DOWNLOAD_SUCCESS=true
                else
                    echo "⚠️  Downloaded file does not appear to be a ZIP archive"
                    rm -f frontend-dist.zip
                fi
            fi
        fi
    elif command -v wget >/dev/null 2>&1; then
        echo "   Using wget..."
        if wget "https://github.com/mahdimma/Jaay-Baan/releases/latest/download/frontend-dist.zip" -O frontend-dist.zip 2>/dev/null; then
            # Validate that the downloaded file is actually a ZIP file
            if command -v file >/dev/null 2>&1; then
                if file frontend-dist.zip | grep -q "Zip archive\|ZIP archive"; then
                    DOWNLOAD_SUCCESS=true
                else
                    echo "⚠️  Downloaded file is not a valid ZIP archive"
                    rm -f frontend-dist.zip
                fi
            else
                # Fallback: check if it's a binary file by looking for ZIP signature
                if head -c 4 frontend-dist.zip 2>/dev/null | grep -q "PK"; then
                    DOWNLOAD_SUCCESS=true
                else
                    echo "⚠️  Downloaded file does not appear to be a ZIP archive"
                    rm -f frontend-dist.zip
                fi
            fi
        fi
    fi

    if [ "$DOWNLOAD_SUCCESS" = false ]; then
        echo "⚠️  Could not download frontend from releases. Building locally..."
        if [ -d "FrontEnd" ]; then
            echo "🔨 Building frontend locally..."
            cd FrontEnd
            if command -v npm >/dev/null 2>&1; then
                npm install
                npm run build
                if [ -d "dist" ]; then
                    if command -v zip >/dev/null 2>&1; then
                        cd dist && zip -r ../../frontend-dist.zip . && cd ..
                    else
                        # Alternative for systems without zip - create tar.gz but name it .zip for consistency
                        cd dist && tar -czf ../../frontend-dist.tar.gz . && cd ..
                        # Move back to main directory and rename the file
                        cd ..
                        mv frontend-dist.tar.gz frontend-dist.zip
                        cd FrontEnd
                    fi
                    cd ..
                    echo "✅ Frontend built locally"
                    DOWNLOAD_SUCCESS=true
                else
                    echo "❌ Frontend build failed - no dist directory created"
                    cd ..
                    exit 1
                fi
            else
                echo "❌ npm not found. Please install Node.js or download a release manually."
                echo "   Download from: https://github.com/mahdimma/Jaay-Baan/releases/latest"
                cd ..
                exit 1
            fi
        else
            echo "❌ No FrontEnd directory found and could not download release."
            echo "   Please ensure internet connection or download manually from:"
            echo "   https://github.com/mahdimma/Jaay-Baan/releases/latest"
            exit 1
        fi
    else
        echo "✅ Frontend downloaded from latest release"
    fi

    # Extract frontend
    echo "📂 Extracting frontend..."

    # Check if the file is a ZIP or TAR.GZ (for local builds without zip command)
    if command -v file >/dev/null 2>&1; then
        FILE_TYPE=$(file frontend-dist.zip)
        if echo "$FILE_TYPE" | grep -q "gzip compressed"; then
            # It's actually a tar.gz file, extract with tar
            echo "   Detected compressed archive (tar.gz format)"
            if command -v tar >/dev/null 2>&1; then
                # Clear any existing static files
                rm -rf BackEnd/jaaybaanbackend/locations/static/frontend/*
                if tar -xzf frontend-dist.zip -C BackEnd/jaaybaanbackend/locations/static/frontend/; then
                    rm frontend-dist.zip
                    echo "✅ Frontend extracted successfully"
                else
                    echo "❌ Failed to extract frontend archive"
                    exit 1
                fi
            else
                echo "❌ tar not found. Cannot extract compressed archive."
                exit 1
            fi
        elif echo "$FILE_TYPE" | grep -q "Zip archive\|ZIP archive"; then
            # It's a proper ZIP file
            echo "   Detected ZIP archive"
            if command -v unzip >/dev/null 2>&1; then
                # Test the ZIP file first
                if unzip -t frontend-dist.zip >/dev/null 2>&1; then
                    # Clear any existing static files
                    rm -rf BackEnd/jaaybaanbackend/locations/static/frontend/*
                    if unzip -o frontend-dist.zip -d BackEnd/jaaybaanbackend/locations/static/frontend/; then
                        rm frontend-dist.zip
                        echo "✅ Frontend extracted successfully"
                    else
                        echo "❌ Failed to extract frontend archive"
                        exit 1
                    fi
                else
                    echo "❌ Frontend archive is corrupted or invalid"
                    echo "   Please try running the script again or build locally"
                    rm -f frontend-dist.zip
                    exit 1
                fi
            else
                echo "❌ unzip not found. Please install unzip."
                case $OS in
                    "linux")
                        echo "   Install: sudo apt-get install unzip (Debian/Ubuntu)"
                        echo "            sudo yum install unzip (RHEL/CentOS)"
                        echo "            sudo pacman -S unzip (Arch)"
                        ;;
                    "macos")
                        echo "   Install: brew install unzip"
                        ;;
                esac
                exit 1
            fi
        else
            echo "❌ Unknown file format: $FILE_TYPE"
            echo "   Expected ZIP archive or compressed tar file"
            exit 1
        fi
    else
        # Fallback when 'file' command is not available
        echo "   Attempting ZIP extraction (file command not available)"
        if command -v unzip >/dev/null 2>&1; then
            # Try unzip first
            if unzip -t frontend-dist.zip >/dev/null 2>&1; then
                # Clear any existing static files
                rm -rf BackEnd/jaaybaanbackend/locations/static/frontend/*
                if unzip -o frontend-dist.zip -d BackEnd/jaaybaanbackend/locations/static/frontend/; then
                    rm frontend-dist.zip
                    echo "✅ Frontend extracted successfully"
                else
                    echo "❌ Failed to extract frontend archive"
                    exit 1
                fi
            elif command -v tar >/dev/null 2>&1; then
                # Try tar if unzip fails
                echo "   ZIP test failed, trying tar extraction"
                rm -rf BackEnd/jaaybaanbackend/locations/static/frontend/*
                if tar -xzf frontend-dist.zip -C BackEnd/jaaybaanbackend/locations/static/frontend/; then
                    rm frontend-dist.zip
                    echo "✅ Frontend extracted successfully"
                else
                    echo "❌ Failed to extract frontend archive"
                    exit 1
                fi
            else
                echo "❌ Cannot extract archive - neither unzip nor tar available"
                exit 1
            fi
        else
            echo "❌ unzip not found. Please install unzip."
            exit 1
        fi
    fi
fi

# Get local IP addresses
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "unknown")
HOSTNAME=$(hostname 2>/dev/null || echo "unknown")
echo "🌐 Local IP: $LOCAL_IP"
echo "🖥️  Hostname: $HOSTNAME"

# Setup environment file
echo "⚙️ Setting up environment..."
SAVED_DB_PASSWORD_FILE="data/postgres/.db_password"
SAVED_DB_PASSWORD=""
if [ -f "$SAVED_DB_PASSWORD_FILE" ]; then
    SAVED_DB_PASSWORD=$(tr -d '\r\n' < "$SAVED_DB_PASSWORD_FILE" || true)
fi
if [ ! -f "BackEnd/.env" ]; then
    # Prefer reusing saved DB password if present (to match existing volume)
    if [ -n "$SAVED_DB_PASSWORD" ]; then
        DB_PASSWORD="$SAVED_DB_PASSWORD"
    else
        DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
    fi
    # Generate secure random password for superuser
    SUPERUSER_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    SECRET_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

    cat > BackEnd/.env << EOF
# Django Settings
DEBUG=False
SECRET_KEY=${SECRET_KEY}
ENV=production

# Database Settings
DB_NAME=jaaybaan_db
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=db
DB_PORT=5432

# Superuser Settings (for first-time setup)
SUPERUSER_USERNAME=admin
SUPERUSER_EMAIL=admin@jaay-baan.local
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD}

# Security Settings
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000,http://${LOCAL_IP}:8000

# Media Settings
MEDIA_URL=/media/
STATIC_URL=/static/
EOF
    echo "✅ Environment file created with secure credentials"
    echo "📝 Superuser credentials generated:"
    echo "   Username: admin"
    echo "   Password: ${SUPERUSER_PASSWORD}"
    echo "   📋 Save these credentials! They will be displayed again after installation."
else
    echo "✅ Environment file already exists"
    # Extract DB_PASSWORD from existing .env to keep saved file in sync
    DB_PASSWORD=$(grep "^DB_PASSWORD=" BackEnd/.env | cut -d'=' -f2- | tr -d '\r')
fi
# Persist DB password locally for future runs
if [ -n "$DB_PASSWORD" ]; then
    echo -n "$DB_PASSWORD" > "$SAVED_DB_PASSWORD_FILE"
fi

# Source the environment file to get DB_PASSWORD
export $(cat BackEnd/.env | grep -v '^#' | xargs)

# Create docker-compose.prod.yml
echo "🐳 Creating Docker Compose configuration..."
cat > docker-compose.prod.yml << EOF
version: "3.8"

services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: jaaybaan_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d jaaybaan_db"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    command: >
      postgres
      -c shared_buffers=32MB
      -c effective_cache_size=128MB

  web:
    build:
      context: ./BackEnd
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - DJANGO_SETTINGS_MODULE=jaaybaanbackend.settings.production
      - ENV=production
      - DEBUG=False
      - DB_HOST=db
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=jaaybaan_db
      - DB_USER=postgres
      - DB_PORT=5432
      - ALLOWED_HOSTS=*
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - SECRET_KEY=${SECRET_KEY}
      - SUPERUSER_USERNAME=${SUPERUSER_USERNAME}
      - SUPERUSER_EMAIL=${SUPERUSER_EMAIL}
      - SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD}
    volumes:
      - media_data:/app/media
    ports:
      - "0.0.0.0:8000:8000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  backup:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      PGHOST: db
      PGPASSWORD: ${DB_PASSWORD}
      PGUSER: postgres
      PGDATABASE: jaaybaan_db
    volumes:
      - ./backups:/backups
      - postgres_data:/var/lib/postgresql/data
      - ./backup-script.sh:/backup-script.sh:ro
    command: >
      sh -c "
        # Install cron
        apk add --no-cache dcron
        
        # Create crontab entry for daily backups at 2 AM
        echo '0 2 * * * /backup-script.sh' | crontab -
        
        # Start cron daemon
        crond -f -d 8
      "
    depends_on:
      - db

volumes:
  postgres_data:
    driver: local
  media_data:
    driver: local
EOF
echo "✅ Docker Compose configuration created"

# Create backup script
echo "📝 Creating backup script..."
cat > backup-script.sh << 'EOF'
#!/bin/sh
# Automated database backup script

echo "$(date): Starting backup process..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="/backups/backup_${timestamp}.sql"

# Create backup
if pg_dump -h db -U postgres -d jaaybaan_db > "$backup_file" 2>/dev/null; then
    echo "$(date): Backup created successfully: backup_${timestamp}.sql"
    
    # Compress the backup to save space
    gzip "$backup_file"
    echo "$(date): Backup compressed to backup_${timestamp}.sql.gz"
    
    # Log backup size and count
    backup_count=$(find /backups -name 'backup_*.sql.gz' | wc -l)
    backup_size=$(du -sh /backups 2>/dev/null | cut -f1)
    echo "$(date): Total backups: ${backup_count}, Total size: ${backup_size}"
else
    echo "$(date): ERROR: Backup failed!"
    exit 1
fi

echo "$(date): Backup process completed"
EOF

chmod +x backup-script.sh
echo "✅ Backup script created"


# Build and start services
echo "🚀 Building and starting Jaay-Baan..."
echo "This may take a few minutes on first run..."
echo "Using: $DOCKER_COMPOSE_CMD"

# Build images first
echo "🔨 Building application images..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml build --no-cache

# Start database service first only
echo "🗄️  Starting database service..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d db

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
echo "Checking database health..."
timeout=300  # 5 minutes
counter=0
while [ $counter -lt $timeout ]; do
    if $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec -T db pg_isready -U postgres -d jaaybaan_db >/dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    sleep 5
    counter=$((counter + 5))
    echo -n "."
done

if [ $counter -ge $timeout ]; then
    echo "❌ Database failed to start within 5 minutes"
    echo "Check logs with: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs db"
    exit 1
fi
# Reset the PostgreSQL password
if $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec -T db psql -U postgres -c "ALTER USER postgres PASSWORD '${DB_PASSWORD}';" >/dev/null 2>&1; then
    echo "✅ Database password updated successfully"
else
    echo "⚠️  Could not update database password, may already be correct"
fi

# Verify DB credentials match existing database before starting web
echo "🔐 Verifying database credentials..."
if ! $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec -T db sh -lc "PGPASSWORD='${DB_PASSWORD}' psql -h 127.0.0.1 -U postgres -d jaaybaan_db -c '\\q'" >/dev/null 2>&1; then
    echo "❌ Django database connection failed: password authentication failed for user 'postgres'"
    echo "Possible cause: existing postgres_data volume initialized with a different password."
    echo "Fix options:"
    echo "  1) Update BackEnd/.env DB_PASSWORD to the existing DB password and rerun."
    echo "  2) Reset the database (DESTRUCTIVE): $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down -v && ./install.sh"
    echo "     This removes the database volume and reinitializes it with the current password."
    exit 1
fi

echo "✅ Database credentials verified"

# Now start web and backup services
echo "🚀 Starting web and backup services..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d --no-deps web backup

echo "Checking web service health..."
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:8000/health/ >/dev/null 2>&1; then
        echo "✅ Web service is ready"
        break
    fi
    sleep 5
    counter=$((counter + 5))
    echo -n "."
done

if [ $counter -ge $timeout ]; then
    echo "❌ Web service failed to start within 5 minutes"
    echo "Check logs with: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs web"
    exit 1
fi



# Get superuser credentials from environment file
SUPERUSER_USERNAME=$(grep "SUPERUSER_USERNAME=" BackEnd/.env | cut -d'=' -f2)
SUPERUSER_PASSWORD=$(grep "SUPERUSER_PASSWORD=" BackEnd/.env | cut -d'=' -f2)

echo ""
echo "🎉 Jaay-Baan is now running!"
echo "================================="
echo ""
echo "🔐 Login Credentials:"
echo "  Username: ${SUPERUSER_USERNAME:-admin}"
echo "  Password: ${SUPERUSER_PASSWORD:-admin123}"
echo "  ⚠️  Change password after first login!"
echo ""
echo "📱 Access URLs:"
echo "  Local:     http://localhost:8000"
echo "  Network:   http://$LOCAL_IP:8000"
echo "  Hostname:  http://$HOSTNAME.local:8000 (if mDNS works)"
echo ""
echo "💾 Data Storage:"
echo "  Database:  Docker volume 'postgres_data'"
echo "  Media:     Docker volume 'media_data'"
echo "  Backups:   ./backups/ (daily at 2 AM)"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:     $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs"
echo "  Stop all:      $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down"
echo "  Start all:     $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d"
echo "  Restart:       $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml restart"
echo "  Update:        git pull && ./install.sh"
echo ""
echo "🗄️  Database Commands:"
echo "  Connect:       $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec db psql -U postgres -d jaaybaan_db"
echo "  Manual backup: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec backup /backup-script.sh"
echo "  Backup logs:   $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs backup"
echo ""
echo "📊 System Status:"
echo "  Check health:  curl http://localhost:8000/health/"
echo "  View status:   $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps"
echo ""
echo "⚠️  Important Notes:"
echo "  - First login may take a moment as the database initializes"
echo "  - Automated backups run daily at 2:00 AM"
echo "  - Access from other devices using the Network URL above"
echo "  - Data persists between restarts in Docker volumes"
echo "  - Backups are compressed (gzipped) to save disk space"
echo ""

# Show current status
echo "Current Status:"
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps
