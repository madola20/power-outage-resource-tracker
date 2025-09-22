"""
locations/admin.py
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Location, LocationUpdate


class LocationUpdateInline(admin.TabularInline):
    model = LocationUpdate
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('update_type', 'notes', 'updated_by', 'created_at')


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'status', 'priority', 'assigned_to', 'reported_at', 'created_at')
    list_filter = ('status', 'priority', 'state', 'city', 'assigned_to', 'reported_by', 'created_at')
    search_fields = ('name', 'address', 'city', 'state', 'zip_code')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Location Information', {
            'fields': ('name', 'address', 'city', 'state', 'zip_code', 'latitude', 'longitude')
        }),
        ('Outage Details', {
            'fields': ('status', 'priority', 'description', 'estimated_customers_affected')
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'reported_by', 'reporter_contact')
        }),
        ('Timestamps', {
            'fields': ('reported_at', 'estimated_restoration', 'actual_restoration'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    inlines = [LocationUpdateInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('assigned_to', 'reported_by')


@admin.register(LocationUpdate)
class LocationUpdateAdmin(admin.ModelAdmin):
    list_display = ('location', 'update_type', 'updated_by', 'created_at')
    list_filter = ('update_type', 'created_at', 'updated_by')
    search_fields = ('location__name', 'notes')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Update Information', {
            'fields': ('location', 'update_type', 'updated_by')
        }),
        ('Status Changes', {
            'fields': ('previous_status', 'new_status'),
            'classes': ('collapse',)
        }),
        ('Details', {
            'fields': ('notes', 'created_at')
        }),
    )
    
    readonly_fields = ('created_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('location', 'updated_by')