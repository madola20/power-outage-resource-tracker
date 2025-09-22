"""
accounts/models.py
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


def generate_uuid():
    """Generate a 10-character UUID for user IDs"""
    return str(uuid.uuid4().hex[:10])


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for the power outage resource tracker
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('team_lead', 'Team Lead'),
        ('team_member', 'Team Member'),
        ('reporter', 'Reporter'),
    ]
    
    id = models.CharField(
        max_length=10,
        default=generate_uuid,
        unique=True,
        editable=False,
        primary_key=True,
    )
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='reporter')
    phone_number = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    @property
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser
    
    @property
    def is_team_lead(self):
        return self.role == 'team_lead'
    
    @property
    def is_team_member(self):
        return self.role == 'team_member'
    
    @property
    def is_reporter(self):
        return self.role == 'reporter'
    
    def can_assign_locations(self):
        """Check if user can assign locations to others"""
        return self.is_admin or self.is_team_lead
    
    def can_view_all_locations(self):
        """Check if user can view all locations"""
        return self.is_admin
    
    def can_edit_locations(self):
        """Check if user can edit location details"""
        return self.is_admin or self.is_team_lead