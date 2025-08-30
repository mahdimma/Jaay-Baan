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
            ("other", "Other"),
        ],
    )
    description = models.TextField(blank=True, null=True)
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

    def save(self, *args, **kwargs):
        """Override save to ensure proper tree structure"""
        if not self.pk and not hasattr(self, "_mp_path"):
            # For new objects without a parent, make it a root node
            if not kwargs.get("parent"):
                super().save(*args, **kwargs)
                return
        super().save(*args, **kwargs)
