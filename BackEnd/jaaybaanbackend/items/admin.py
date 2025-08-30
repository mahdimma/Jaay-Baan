from django.contrib import admin
from .models import Item, ItemImage


class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'created_at')
    list_filter = ('location', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ItemImageInline]


@admin.register(ItemImage)
class ItemImageAdmin(admin.ModelAdmin):
    list_display = ('item', 'description', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    readonly_fields = ('created_at',)
