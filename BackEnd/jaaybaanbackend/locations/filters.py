import django_filters
from .models import Location


class LocationFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    description = django_filters.CharFilter(lookup_expr="icontains")
    location_type = django_filters.ChoiceFilter(
        choices=Location._meta.get_field("location_type").choices
    )
    is_container = django_filters.BooleanFilter()
    has_barcode = django_filters.BooleanFilter(method="filter_has_barcode")
    parent_id = django_filters.NumberFilter(method="filter_by_parent")
    needs_cleaning = django_filters.BooleanFilter(method="filter_needs_cleaning")
    value_min = django_filters.NumberFilter(field_name="value", lookup_expr="gte")
    value_max = django_filters.NumberFilter(field_name="value", lookup_expr="lte")
    quantity_min = django_filters.NumberFilter(field_name="quantity", lookup_expr="gte")
    quantity_max = django_filters.NumberFilter(field_name="quantity", lookup_expr="lte")

    class Meta:
        model = Location
        fields = ["name", "description", "location_type", "is_container"]

    def filter_has_barcode(self, queryset, name, value):
        if value:
            return queryset.exclude(barcode__isnull=True).exclude(barcode="")
        else:
            return queryset.filter(
                django_filters.Q(barcode__isnull=True) | django_filters.Q(barcode="")
            )

    def filter_by_parent(self, queryset, name, value):
        try:
            parent = Location.objects.get(id=value)
            return queryset.filter(id__in=parent.get_descendants())
        except Location.DoesNotExist:
            return queryset.none()

    def filter_needs_cleaning(self, queryset, name, value):
        # This will be slower for large datasets, but functional for MVP
        location_ids = []
        for location in queryset:
            if location.needs_cleaning() == value:
                location_ids.append(location.id)
        return queryset.filter(id__in=location_ids)
