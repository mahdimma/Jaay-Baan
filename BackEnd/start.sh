#!/bin/bash
set -e

echo "Starting Jaay-Baan Backend..."

# Ensure we're using production settings
export DJANGO_ENV=production

# Debug: Print database connection info (without sensitive password)
echo "Database connection details:"
echo "  Host: ${DB_HOST}"
echo "  Port: ${DB_PORT}"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: $(echo ${DB_PASSWORD} | sed 's/./*/g')"

# Change to the directory containing manage.py
cd /app/jaaybaanbackend

# Wait for database to be ready
echo "Waiting for database..."
while ! pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}; do
    echo "Database is unavailable - sleeping"
    sleep 2
done
echo "Database is ready!"

# Test Django database connection
echo "Testing Django database connection..."
python manage.py shell -c "
from django.db import connection
try:
    cursor = connection.cursor()
    cursor.execute('SELECT 1')
    print('✅ Django database connection successful')
except Exception as e:
    print(f'❌ Django database connection failed: {e}')
    exit(1)
"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if it doesn't exist
echo "Creating superuser if needed..."
python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser 'admin' created with password 'admin123'")
else:
    print("Superuser already exists")
EOF

# Create sample data if database is empty
echo "Checking for sample data..."
python manage.py shell << 'EOF'
from locations.models import Location
if not Location.objects.exists():
    print("Creating sample data...")
    # Create root locations
    home = Location.add_root(
        name="خانه",
        name_en="Home",
        location_type="container",
        is_container=True,
        description="محل اصلی سکونت"
    )
    
    office = Location.add_root(
        name="دفتر کار",
        name_en="Office",
        location_type="container", 
        is_container=True,
        description="محل کار"
    )
    
    # Add some sample rooms
    kitchen = home.add_child(
        name="آشپزخانه",
        name_en="Kitchen",
        location_type="room",
        is_container=True,
        description="آشپزخانه خانه"
    )
    
    bedroom = home.add_child(
        name="اتاق خواب",
        name_en="Bedroom", 
        location_type="room",
        is_container=True,
        description="اتاق خواب اصلی"
    )
    
    # Add some containers
    fridge = kitchen.add_child(
        name="یخچال",
        name_en="Refrigerator",
        location_type="appliance",
        is_container=True,
        description="یخچال آشپزخانه"
    )
    
    wardrobe = bedroom.add_child(
        name="کمد لباس",
        name_en="Wardrobe",
        location_type="furniture", 
        is_container=True,
        description="کمد لباس اتاق خواب"
    )
    
    print("Sample data created successfully!")
else:
    print("Sample data already exists")
EOF

# Start Gunicorn with optimized settings for local deployment
echo "Starting Gunicorn..."
exec gunicorn jaaybaanbackend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --worker-class gthread \
    --threads 2 \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 60 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output
