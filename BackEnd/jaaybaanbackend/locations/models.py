import re
from django.db import models
from treebeard.mp_tree import MP_Node


def location_image_upload_path(instance, filename):
    """
    Generate a custom filename for location images.
    Format: {location_id}_{location_name}_{location_image_id}.{extension}
    """
    # Get file extension
    ext = filename.split(".")[-1].lower()

    # Clean location name - remove special characters and spaces
    clean_name = re.sub(r"[^\w\s-]", "", instance.location.name)
    clean_name = re.sub(r"[-\s]+", "_", clean_name)

    # If instance has an ID (updating existing image), use it
    if instance.pk:
        new_filename = f"{instance.location.id}_{clean_name}_{instance.pk}.{ext}"
    else:
        # For new images, get existing images count to determine the next number
        existing_count = LocationImage.objects.filter(
            location=instance.location
        ).count()
        new_number = existing_count + 1
        new_filename = f"{instance.location.id}_{clean_name}_{new_number}.{ext}"

    return f"location_images/{new_filename}"


class Location(MP_Node):
    name = models.CharField(max_length=255)
    location_type = models.CharField(
        max_length=50,
        choices=[
            ("house", "House"),
            ("room", "Room"),
            ("storage", "Storage"),
            ("shelf", "Shelf"),
            ("container", "Container"),
            ("box", "Box"),
            ("item", "Item"),
            ("other", "Other"),
        ],
    )
    description = models.TextField(blank=True, null=True)

    # Container setting
    is_container = models.BooleanField(
        default=True, help_text="Can this location contain other items/locations?"
    )

    # Item fields
    barcode = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    # Cleaning tracking
    cleaned_time = models.DateTimeField(
        auto_now_add=True, help_text="When this location was last cleaned"
    )
    cleaned_duration = models.PositiveIntegerField(
        default=30,
        help_text="Duration in days before this location needs cleaning again",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    node_order_by = ["name"]

    class Meta:
        ordering = ["path"]

    def __str__(self):
        return self.name

    def get_breadcrumb(self):
        """Returns the path as breadcrumb"""
        ancestors = list(self.get_ancestors()) + [self]
        return " > ".join([ancestor.name for ancestor in ancestors])

    def get_all_items(self):
        """Get all items in this location and its descendants"""
        return self.get_descendants(include_self=True)

    def get_immediate_items(self):
        """Get only direct items in this location"""
        return self.get_children()

    def get_containers(self):
        """Get only containers in this location"""
        return self.get_children().filter(is_container=True)

    def get_leaf_items(self):
        """Get items that are not containers (leaf nodes)"""
        return self.get_descendants(include_self=True).filter(is_container=False)

    def needs_cleaning(self):
        """Check if this location needs cleaning based on cleaned_time and cleaned_duration"""
        from django.utils import timezone
        from datetime import timedelta

        if not self.cleaned_time:
            return True

        next_cleaning_date = self.cleaned_time + timedelta(days=self.cleaned_duration)
        return timezone.now() > next_cleaning_date

    def mark_as_cleaned(self):
        """Mark this location as cleaned by updating the cleaned_time to now"""
        from django.utils import timezone

        self.cleaned_time = timezone.now()
        self.save(update_fields=["cleaned_time"])

    def save(self, *args, **kwargs):
        """Override save to ensure proper tree structure"""
        # If it's not a container, it can't have children
        if not self.is_container and self.pk:
            if self.get_children().exists():
                raise ValueError(
                    "Cannot make a location non-container if it has children"
                )

        if not self.pk and not hasattr(self, "_mp_path"):
            # For new objects without a parent, make it a root node
            if not kwargs.get("parent"):
                super().save(*args, **kwargs)
                return
        super().save(*args, **kwargs)


class LocationImage(models.Model):
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to=location_image_upload_path)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"{self.location.name} - Image"

    def save(self, *args, **kwargs):
        """
        Override save to ensure only one primary image per location
        """
        if self.is_primary:
            # Set all other images of this location to non-primary
            LocationImage.objects.filter(
                location=self.location, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
