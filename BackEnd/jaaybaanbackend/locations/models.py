from django.db import models
from treebeard.mp_tree import MP_Node


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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    node_order_by = ["name"]

    class Meta:
        ordering = ["path"]

    def __str__(self):
        return self.name

    def get_breadcrumb(self):
        """Returns the path as breadcrumb"""
        return " > ".join(
            [ancestor.name for ancestor in self.get_ancestors(include_self=True)]
        )

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
    image = models.ImageField(upload_to="location_images/")
    description = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"{self.location.name} - Image"
