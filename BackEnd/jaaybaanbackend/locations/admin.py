from django.contrib import admin
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory
from .models import Location


@admin.register(Location)
class LocationAdmin(TreeAdmin):
    form = movenodeform_factory(Location)
    list_display = ("name", "location_type", "get_depth", "created_at")
    list_filter = ("location_type", "created_at")
    search_fields = ("name", "description")
    readonly_fields = ("path", "depth", "numchild", "created_at", "updated_at")

    def get_depth(self, obj):
        return obj.get_depth()

    get_depth.short_description = "Depth"
