from django.contrib import admin
from django import forms
from treebeard.admin import TreeAdmin
from .models import Location, LocationImage


class LocationAdminForm(forms.ModelForm):
    _position = forms.CharField(required=False, widget=forms.HiddenInput())
    _ref_node_id = forms.ModelChoiceField(
        queryset=Location.objects.all(),
        required=False,
        empty_label="Root Level",
        label="Parent Location",
        help_text="Select parent location or leave empty for root level",
    )

    class Meta:
        model = Location
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # If editing existing object, set current parent
        if self.instance and self.instance.pk:
            parent = self.instance.get_parent()
            if parent:
                self.fields["_ref_node_id"].initial = parent.pk


class LocationImageInline(admin.TabularInline):
    model = LocationImage
    extra = 1


@admin.register(Location)
class LocationAdmin(TreeAdmin):
    form = LocationAdminForm
    list_display = (
        "name",
        "location_type",
        "is_container",
        "needs_cleaning",
        "cleaned_time",
    )
    list_filter = ("location_type", "is_container", "created_at", "cleaned_time")
    search_fields = ("name", "description", "barcode")
    readonly_fields = (
        "path",
        "depth",
        "numchild",
        "cleaned_time",
        "created_at",
        "updated_at",
    )
    inlines = [LocationImageInline]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "location_type", "description")}),
        ("Hierarchy", {"fields": ("_ref_node_id",)}),
        ("Container Settings", {"fields": ("is_container",)}),
        (
            "Item Details",
            {
                "fields": ("barcode", "quantity", "value"),
                "description": "Item-specific information",
            },
        ),
        (
            "Cleaning Information",
            {
                "fields": ("cleaned_duration", "cleaned_time"),
                "description": "Track cleaning schedule and last cleaning time",
            },
        ),
        (
            "Tree Information",
            {"fields": ("path", "depth", "numchild"), "classes": ("collapse",)},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def get_depth(self, obj):
        return obj.get_depth()

    get_depth.short_description = "Depth"

    def get_parent_name(self, obj):
        parent = obj.get_parent()
        return parent.name if parent else "Root"

    get_parent_name.short_description = "Parent"

    def needs_cleaning(self, obj):
        """Display cleaning status with visual indicator"""
        if obj.needs_cleaning():
            return "🔴"
        else:
            return "✅"

    needs_cleaning.short_description = "Clean"
    needs_cleaning.admin_order_field = "cleaned_time"

    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            ref_node_id = form.cleaned_data.get("_ref_node_id")
            if ref_node_id:
                # Add as child of selected parent
                ref_node_id.add_child(instance=obj)
            else:
                # Add as root node
                Location.add_root(instance=obj)
        else:  # Updating existing object
            ref_node_id = form.cleaned_data.get("_ref_node_id")
            current_parent = obj.get_parent()

            # Check if parent has changed
            if (ref_node_id and current_parent != ref_node_id) or (
                not ref_node_id and current_parent
            ):
                if ref_node_id:
                    # Move to new parent
                    obj.move(ref_node_id, pos="last-child")
                else:
                    # Move to root level
                    obj.move(Location.get_root_nodes().first(), pos="left")

            super().save_model(request, obj, form, change)


@admin.register(LocationImage)
class LocationImageAdmin(admin.ModelAdmin):
    list_display = ("location", "description", "is_primary", "created_at", "updated_at")
    list_filter = ("is_primary", "created_at", "updated_at")
    readonly_fields = ("created_at", "updated_at")
