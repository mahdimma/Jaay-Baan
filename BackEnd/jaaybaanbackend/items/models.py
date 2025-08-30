from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.ForeignKey(
        'locations.Location',
        on_delete=models.CASCADE,
        related_name='items'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return self.name

    def get_breadcrumb(self):
        """Returns location breadcrumb + item name"""
        location_breadcrumb = self.location.get_breadcrumb()
        return f"{location_breadcrumb} > {self.name}"


class ItemImage(models.Model):
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='item_images/')
    description = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'created_at']

    def __str__(self):
        return f"{self.item.name} - Image"
