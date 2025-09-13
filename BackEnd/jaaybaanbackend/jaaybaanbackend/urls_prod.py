"""
Production URLs for Jaay-Baan
Serves React app at root and API endpoints
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.views.static import serve


def health_check(request):
    """Health check endpoint for monitoring"""
    return JsonResponse(
        {"status": "healthy", "service": "jaay-baan-backend", "version": "1.0.0"}
    )


# API URLs
api_patterns = [
    path("auth/", include("authentication.urls")),
    path("locations/", include("locations.urls")),
]

urlpatterns = [
    # Admin interface
    path("admin/", admin.site.urls),
    # Health check
    path("health/", health_check, name="health-check"),
    # API endpoints
    path("api/v1/", include(api_patterns)),
    # Media files - serve with caching
    re_path(
        r"^media/(?P<path>.*)$",
        cache_page(60 * 15)(serve),
        {"document_root": settings.MEDIA_ROOT},
        name="media-files",
    ),
]

# Serve media files in production
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve React app for all other routes (SPA routing)
urlpatterns += [
    re_path(
        r"^.*$", TemplateView.as_view(template_name="index.html"), name="react-app"
    ),
]
