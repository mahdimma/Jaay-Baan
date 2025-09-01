from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.conf import settings
import os


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """API health check endpoint"""

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    # Check media directory
    media_accessible = os.path.exists(settings.MEDIA_ROOT)

    response_data = {
        "status": "healthy"
        if db_status == "healthy" and media_accessible
        else "unhealthy",
        "database": db_status,
        "media_storage": "accessible" if media_accessible else "not accessible",
        "debug_mode": settings.DEBUG,
        "version": "1.0.0",
    }

    return Response(response_data)
