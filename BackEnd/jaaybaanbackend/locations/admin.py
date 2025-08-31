from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
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

        # Filter parent choices to only show containers
        self.fields["_ref_node_id"].queryset = Location.objects.filter(
            is_container=True
        )

    def clean(self):
        """Validate form data"""
        cleaned_data = super().clean()
        ref_node_id = cleaned_data.get("_ref_node_id")

        # If a parent is selected, ensure it's a container
        if ref_node_id and not ref_node_id.is_container:
            raise forms.ValidationError(
                f"Cannot add to '{ref_node_id.name}' because it is not a container."
            )

        return cleaned_data


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

    def has_delete_permission(self, request, obj=None):
        """Hide delete option for locations with children"""
        if obj and obj.get_children().exists():
            return False
        return super().has_delete_permission(request, obj)

    def delete_model(self, request, obj):
        """Custom delete with user-friendly error handling"""
        try:
            super().delete_model(request, obj)
        except (ValueError, ValidationError) as e:
            from django.contrib import messages

            messages.error(request, str(e))

    def delete_queryset(self, request, queryset):
        """Handle bulk deletion with error checking"""
        from django.contrib import messages

        # Check which objects have children
        objects_with_children = []
        objects_to_delete = []

        for obj in queryset:
            if obj.get_children().exists():
                objects_with_children.append(obj.name)
            else:
                objects_to_delete.append(obj)

        # Delete objects without children
        if objects_to_delete:
            for obj in objects_to_delete:
                obj.delete()
            messages.success(
                request, f"Successfully deleted {len(objects_to_delete)} location(s)."
            )

        # Show error for objects with children
        if objects_with_children:
            messages.error(
                request,
                f"Cannot delete locations with children: {', '.join(objects_with_children)}. "
                "Please delete or move their children first.",
            )

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
