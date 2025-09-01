from django.urls import path
from . import views

urlpatterns = [
    # Location CRUD
    path("", views.LocationListCreateView.as_view(), name="location-list-create"),
    path("<int:pk>/", views.LocationDetailView.as_view(), name="location-detail"),
    # Location tree and navigation
    path("tree/", views.location_tree, name="location-tree"),
    path("<int:pk>/breadcrumb/", views.location_breadcrumb, name="location-breadcrumb"),
    # Location operations
    path("<int:pk>/move/", views.location_move, name="location-move"),
    path(
        "<int:pk>/mark-cleaned/",
        views.location_mark_cleaned,
        name="location-mark-cleaned",
    ),
    # Search and filtering
    path("search/", views.location_search, name="location-search"),
    path(
        "needing-cleaning/",
        views.locations_needing_cleaning,
        name="locations-needing-cleaning",
    ),
    path("statistics/", views.location_statistics, name="location-statistics"),
    path(
        "bulk-operations/",
        views.location_bulk_operations,
        name="location-bulk-operations",
    ),
    # Data management
    path("export/", views.location_export, name="location-export"),
    path("import/", views.location_import, name="location-import"),
    # Location images
    path(
        "<int:location_id>/images/",
        views.LocationImageListCreateView.as_view(),
        name="location-image-list-create",
    ),
    path(
        "<int:location_id>/images/<int:pk>/",
        views.LocationImageDetailView.as_view(),
        name="location-image-detail",
    ),
]
