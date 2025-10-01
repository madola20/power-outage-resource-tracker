"""
locations/models.py
"""
import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User


def generate_uuid():
    """Generate a 10-character UUID for location IDs"""
    return str(uuid.uuid4().hex[:10])


class Location(models.Model):
    """
    Model for tracking power outage locations
    """
    STATUS_CHOICES = [
        ('reported', 'Reported'),
        ('investigating', 'Investigating'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    id = models.CharField(
        max_length=10,
        default=generate_uuid,
        unique=True,
        editable=False,
        primary_key=True,
    )
    
    # Location details
    name = models.CharField(max_length=255, help_text="Name or description of the location")
    address = models.TextField(help_text="Full address of the location")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Outage details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reported')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    description = models.TextField(blank=True, help_text="Description of the power outage")
    estimated_customers_affected = models.PositiveIntegerField(null=True, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_locations',
        limit_choices_to={'role__in': ['admin', 'team_lead', 'team_member']}
    )
    
    # Reporter information
    reported_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reported_locations',
        limit_choices_to={'role': 'reporter'}
    )
    reporter_email = models.EmailField(blank=True, help_text="Reporter's email address")
    reporter_phone = models.CharField(max_length=20, blank=True, help_text="Reporter's phone number")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reported_at = models.DateTimeField(default=timezone.now)
    estimated_restoration = models.DateTimeField(null=True, blank=True)
    actual_restoration = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'locations_location'
        ordering = ['-created_at']
        verbose_name = 'Location'
        verbose_name_plural = 'Locations'
    
    def __str__(self):
        return f"{self.name} - {self.city}, {self.state}"
    
    @property
    def is_assigned(self):
        return self.assigned_to is not None
    
    @property
    def is_resolved(self):
        return self.status == 'resolved'
    
    @property
    def is_critical(self):
        return self.priority == 'critical'
    
    def can_be_assigned_by(self, user):
        """Check if a user can assign this location"""
        if not user.is_authenticated:
            return False
        return user.can_assign_locations()
    
    def can_be_edited_by(self, user):
        """Check if a user can edit this location"""
        if not user.is_authenticated:
            return False
        return user.can_edit_locations() or self.assigned_to == user


class LocationUpdate(models.Model):
    """
    Model for tracking updates to locations
    """
    id = models.CharField(
        max_length=10,
        default=generate_uuid,
        unique=True,
        editable=False,
        primary_key=True,
    )
    
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    update_type = models.CharField(
        max_length=20,
        choices=[
            ('status_change', 'Status Change'),
            ('assignment', 'Assignment'),
            ('priority_change', 'Priority Change'),
            ('general_update', 'General Update'),
        ],
        default='general_update'
    )
    previous_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20, blank=True)
    notes = models.TextField(help_text="Update notes or comments")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'locations_locationupdate'
        ordering = ['-created_at']
        verbose_name = 'Location Update'
        verbose_name_plural = 'Location Updates'
    
    def __str__(self):
        return f"Update for {self.location.name} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"