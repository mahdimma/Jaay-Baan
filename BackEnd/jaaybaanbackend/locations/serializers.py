from rest_framework import serializers
from .models import Location, LocationImage


class LocationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationImage
        fields = ["id", "image", "description", "is_primary", "created_at"]
        read_only_fields = ["id", "created_at"]


class LocationSerializer(serializers.ModelSerializer):
    images = LocationImageSerializer(many=True, read_only=True)
    breadcrumb = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()
    needs_cleaning = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "location_type",
            "description",
            "is_container",
            "barcode",
            "quantity",
            "value",
            "cleaned_time",
            "cleaned_duration",
            "created_at",
            "updated_at",
            "breadcrumb",
            "children_count",
            "needs_cleaning",
            "images",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_breadcrumb(self, obj):
        return obj.get_breadcrumb()

    def get_children_count(self, obj):
        return obj.get_children().count()

    def get_needs_cleaning(self, obj):
        return obj.needs_cleaning()

    def validate_is_container(self, value):
        """
        Validate that is_container cannot be changed from True to False
        if the location has children.
        """
        # Only validate during update operations
        if self.instance:
            # If trying to change from True to False
            if self.instance.is_container and not value:
                # Check if location has children
                if self.instance.get_children().exists():
                    raise serializers.ValidationError(
                        "Cannot change container status to non-container when location has children. "
                        "Please move or delete all child locations first."
                    )
        return value


class LocationTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    breadcrumb = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "location_type",
            "description",
            "is_container",
            "barcode",
            "quantity",
            "value",
            "breadcrumb",
            "children",
        ]

    def get_breadcrumb(self, obj):
        return obj.get_breadcrumb()

    def get_children(self, obj):
        children = obj.get_children()
        return LocationTreeSerializer(children, many=True).data


class LocationBreadcrumbSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name", "location_type"]


class LocationMoveSerializer(serializers.Serializer):
    new_parent_id = serializers.IntegerField(allow_null=True, required=False)
    position = serializers.CharField(required=False, default="last-child")

    def validate_position(self, value):
        valid_positions = ["first-child", "last-child", "left", "right"]
        if value not in valid_positions:
            raise serializers.ValidationError(
                f"Position must be one of: {', '.join(valid_positions)}"
            )
        return value


class LocationSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=255)
    location_type = serializers.CharField(max_length=50, required=False)
    needs_cleaning = serializers.BooleanField(required=False)
    has_barcode = serializers.BooleanField(required=False)
    parent_id = serializers.IntegerField(required=False)


class LocationExportSerializer(serializers.ModelSerializer):
    breadcrumb_path = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "location_type",
            "description",
            "is_container",
            "barcode",
            "quantity",
            "value",
            "cleaned_duration",
            "breadcrumb_path",
            "parent_name",
            "images_count",
            "created_at",
        ]

    def get_breadcrumb_path(self, obj):
        return obj.get_breadcrumb()

    def get_parent_name(self, obj):
        parent = obj.get_parent()
        return parent.name if parent else None

    def get_images_count(self, obj):
        return obj.images.count()


class LocationImportSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    location_type = serializers.ChoiceField(
        choices=Location._meta.get_field("location_type").choices
    )
    description = serializers.CharField(required=False, allow_blank=True)
    is_container = serializers.BooleanField(default=True)
    barcode = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(default=1)
    value = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    cleaned_duration = serializers.IntegerField(default=30)
    parent_id = serializers.IntegerField(required=False, allow_null=True)
