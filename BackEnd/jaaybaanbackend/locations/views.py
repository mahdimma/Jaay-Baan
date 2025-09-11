from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Location, LocationImage
from .serializers import (
    LocationSerializer,
    LocationTreeSerializer,
    LocationBreadcrumbSerializer,
    LocationMoveSerializer,
    LocationSearchSerializer,
    LocationImageSerializer,
    LocationExportSerializer,
)


class LocationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class LocationListCreateView(generics.ListCreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = LocationPagination

    def get_queryset(self):
        queryset = Location.objects.all()
        parent_id = self.request.query_params.get("parent_id")
        location_type = self.request.query_params.get("location_type")

        if parent_id:
            if parent_id == "root":
                queryset = Location.get_root_nodes()
            else:
                parent = get_object_or_404(Location, id=parent_id)
                queryset = parent.get_children()

        if location_type:
            queryset = queryset.filter(location_type=location_type)

        return queryset.order_by("path")

    def perform_create(self, serializer):
        parent_id = self.request.data.get("parent_id")
        validated_data = serializer.validated_data

        if parent_id:
            parent = get_object_or_404(Location, id=parent_id)
            if not parent.is_container:
                raise serializers.ValidationError(
                    "Cannot add items to a non-container location"
                )
            # Create as child using django-treebeard method
            location = parent.add_child(**validated_data)
        else:
            # Create as root node using django-treebeard method
            location = Location.add_root(**validated_data)

        # Set the created instance back to the serializer
        serializer.instance = location


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check if location has children
        children_count = instance.get_children().count()
        if children_count > 0:
            return Response(
                {
                    "detail": "Cannot delete location that has child locations. Please delete or move all child locations first.",
                    "children_count": children_count,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete the instance
        instance.delete()

        # Return success response with 204 No Content
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def location_tree(request):
    """Get complete location tree or subtree"""
    parent_id = request.query_params.get("parent_id")

    if parent_id:
        parent = get_object_or_404(Location, id=parent_id)
        locations = [parent]
    else:
        locations = Location.get_root_nodes()

    serializer = LocationTreeSerializer(locations, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def location_breadcrumb(request, pk):
    """Get breadcrumb for a specific location"""
    location = get_object_or_404(Location, id=pk)
    ancestors = list(location.get_ancestors()) + [location]
    serializer = LocationBreadcrumbSerializer(ancestors, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def location_move(request, pk):
    """Move a location to a new parent"""
    location = get_object_or_404(Location, id=pk)
    serializer = LocationMoveSerializer(data=request.data)

    if serializer.is_valid():
        new_parent_id = serializer.validated_data.get("new_parent_id")

        try:
            if new_parent_id:
                new_parent = get_object_or_404(Location, id=new_parent_id)

                # Check if trying to move to itself
                if new_parent.id == location.id:
                    return Response(
                        {"error": "Cannot move location to itself"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if not new_parent.is_container:
                    return Response(
                        {"error": "Cannot move to a non-container location"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Check if new_parent is not a descendant of location
                if new_parent in location.get_descendants():
                    return Response(
                        {"error": "Cannot move location to its own descendant"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                location.move(new_parent, pos="sorted-child")
            else:
                # Move to root level
                first_root = Location.get_first_root_node()
                if first_root:
                    location.move(first_root, pos="sorted-sibling")
                else:
                    # If no root nodes exist, convert to root
                    location.move(None, pos="sorted-child")

            return Response({"message": "Location moved successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def location_search(request):
    """Search locations with various filters"""
    serializer = LocationSearchSerializer(data=request.query_params)

    if serializer.is_valid():
        query = serializer.validated_data.get("query")
        location_type = serializer.validated_data.get("location_type")
        needs_cleaning = serializer.validated_data.get("needs_cleaning")
        has_barcode = serializer.validated_data.get("has_barcode")
        parent_id = serializer.validated_data.get("parent_id")

        queryset = Location.objects.all()

        # Text search in name, description, barcode, and breadcrumb path
        if query:
            # Get all locations first to search in breadcrumbs
            all_locations = list(queryset)
            matching_ids = []

            for location in all_locations:
                # Search in name, description, barcode
                if (
                    query.lower() in location.name.lower()
                    or (
                        location.description
                        and query.lower() in location.description.lower()
                    )
                    or (location.barcode and query.lower() in location.barcode.lower())
                    or query.lower() in location.get_breadcrumb().lower()
                ):
                    matching_ids.append(location.id)

            queryset = queryset.filter(id__in=matching_ids)

        if location_type:
            queryset = queryset.filter(location_type=location_type)

        if has_barcode is not None:
            if has_barcode:
                queryset = queryset.exclude(barcode__isnull=True).exclude(barcode="")
            else:
                queryset = queryset.filter(Q(barcode__isnull=True) | Q(barcode=""))

        if parent_id:
            parent = get_object_or_404(Location, id=parent_id)
            queryset = queryset.filter(id__in=parent.get_descendants())

        # Filter by cleaning status if specified
        if needs_cleaning is not None:
            if needs_cleaning:
                queryset = [loc for loc in queryset if loc.needs_cleaning()]
            else:
                queryset = [loc for loc in queryset if not loc.needs_cleaning()]

        # Convert back to queryset if it was filtered by needs_cleaning
        if isinstance(queryset, list):
            location_ids = [loc.id for loc in queryset]
            queryset = Location.objects.filter(id__in=location_ids)

        # Paginate results
        paginator = LocationPagination()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = LocationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = LocationSerializer(queryset, many=True)
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def location_mark_cleaned(request, pk):
    """Mark a location as cleaned"""
    location = get_object_or_404(Location, id=pk)
    location.mark_as_cleaned()

    return Response(
        {"message": "Location marked as cleaned", "cleaned_time": location.cleaned_time}
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def locations_needing_cleaning(request):
    """Get all locations that need cleaning"""
    all_locations = Location.objects.all()
    locations_needing_cleaning = [loc for loc in all_locations if loc.needs_cleaning()]

    # Convert to queryset for pagination
    location_ids = [loc.id for loc in locations_needing_cleaning]
    queryset = Location.objects.filter(id__in=location_ids)

    paginator = LocationPagination()
    page = paginator.paginate_queryset(queryset, request)

    if page is not None:
        serializer = LocationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = LocationSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def location_statistics(request):
    """Get overall system statistics"""
    all_locations = Location.objects.all()

    stats = {
        "total_locations": all_locations.count(),
        "containers": all_locations.filter(is_container=True).count(),
        "items": all_locations.filter(is_container=False).count(),
        "locations_needing_cleaning": len(
            [loc for loc in all_locations if loc.needs_cleaning()]
        ),
        "locations_with_images": all_locations.filter(images__isnull=False)
        .distinct()
        .count(),
        "locations_with_barcode": all_locations.exclude(barcode__isnull=True)
        .exclude(barcode="")
        .count(),
        "by_type": {},
    }

    # Count by location type
    for choice in Location._meta.get_field("location_type").choices:
        type_code, type_name = choice
        stats["by_type"][type_code] = {
            "name": type_name,
            "count": all_locations.filter(location_type=type_code).count(),
        }

    return Response(stats)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def location_bulk_operations(request):
    """Perform bulk operations on multiple locations"""
    operation = request.data.get("operation")
    location_ids = request.data.get("location_ids", [])

    if not operation or not location_ids:
        return Response(
            {"error": "operation and location_ids are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    locations = Location.objects.filter(id__in=location_ids)

    if not locations.exists():
        return Response(
            {"error": "No valid locations found"}, status=status.HTTP_404_NOT_FOUND
        )

    results = {
        "operation": operation,
        "total_requested": len(location_ids),
        "processed": 0,
        "failed": [],
        "success": True,
    }

    if operation == "mark_cleaned":
        for location in locations:
            try:
                location.mark_as_cleaned()
                results["processed"] += 1
            except Exception as e:
                results["failed"].append(
                    {"id": location.id, "name": location.name, "error": str(e)}
                )

    elif operation == "delete":
        for location in locations:
            try:
                if location.get_children().exists():
                    results["failed"].append(
                        {
                            "id": location.id,
                            "name": location.name,
                            "error": "Cannot delete location with children",
                        }
                    )
                else:
                    location.delete()
                    results["processed"] += 1
            except Exception as e:
                results["failed"].append(
                    {"id": location.id, "name": location.name, "error": str(e)}
                )

    elif operation == "move_to_parent":
        new_parent_id = request.data.get("new_parent_id")
        if not new_parent_id:
            return Response(
                {"error": "new_parent_id is required for move operation"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_parent = Location.objects.get(id=new_parent_id)
            if not new_parent.is_container:
                return Response(
                    {"error": "Target location is not a container"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Location.DoesNotExist:
            return Response(
                {"error": "Target parent location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        for location in locations:
            try:
                # Check if trying to move to itself
                if new_parent.id == location.id:
                    results["failed"].append(
                        {
                            "id": location.id,
                            "name": location.name,
                            "error": "Cannot move location to itself",
                        }
                    )
                # Check if new_parent is not a descendant of location
                elif new_parent in location.get_descendants():
                    results["failed"].append(
                        {
                            "id": location.id,
                            "name": location.name,
                            "error": "Cannot move location to its own descendant",
                        }
                    )
                else:
                    location.move(new_parent, pos="sorted-child")
                    results["processed"] += 1
            except Exception as e:
                results["failed"].append(
                    {"id": location.id, "name": location.name, "error": str(e)}
                )

    else:
        return Response(
            {"error": f"Unknown operation: {operation}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if results["failed"]:
        results["success"] = False

    return Response(results)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def location_export(request):
    """Export all locations data"""
    queryset = Location.objects.all().order_by("path")
    serializer = LocationExportSerializer(queryset, many=True)

    return Response(
        {
            "count": queryset.count(),
            "data": serializer.data,
            "exported_at": timezone.now(),
        }
    )


# Location Images Views
class LocationImageListCreateView(generics.ListCreateAPIView):
    serializer_class = LocationImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        location_id = self.kwargs["location_id"]
        return LocationImage.objects.filter(location_id=location_id)

    def perform_create(self, serializer):
        location_id = self.kwargs["location_id"]
        location = get_object_or_404(Location, id=location_id)
        serializer.save(location=location)


class LocationImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LocationImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        location_id = self.kwargs["location_id"]
        return LocationImage.objects.filter(location_id=location_id)
