"""
authentication/admin.py
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import ValidationToken


@admin.register(ValidationToken)
class ValidationTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_type', 'generated_date', 'expires_at', 'is_valid_display', 'used')
    list_filter = ('token_type', 'valid', 'used', 'generated_date')
    search_fields = ('user__email', 'token')
    ordering = ('-generated_date',)
    
    fieldsets = (
        ('Token Information', {
            'fields': ('user', 'token_type', 'token')
        }),
        ('Status', {
            'fields': ('valid', 'used', 'generated_date', 'expires_at')
        }),
    )
    
    readonly_fields = ('generated_date', 'expires_at')
    
    def is_valid_display(self, obj):
        if obj.is_valid():
            return format_html('<span style="color: green;">✓ Valid</span>')
        elif obj.is_expired():
            return format_html('<span style="color: red;">✗ Expired</span>')
        elif obj.used:
            return format_html('<span style="color: orange;">✗ Used</span>')
        else:
            return format_html('<span style="color: red;">✗ Invalid</span>')
    
    is_valid_display.short_description = 'Status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')