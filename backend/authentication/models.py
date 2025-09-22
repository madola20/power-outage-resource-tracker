"""
authentication/models.py
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.models import User


class ValidationToken(models.Model):
    """
    Model for storing validation tokens (password reset, email verification, etc.)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=512, unique=True, db_index=True)
    token_type = models.CharField(
        max_length=20,
        choices=[
            ('password_reset', 'Password Reset'),
            ('email_verification', 'Email Verification'),
            ('account_activation', 'Account Activation'),
        ],
        default='password_reset'
    )
    generated_date = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    valid = models.BooleanField(default=True)
    used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'authentication_validationtoken'
        ordering = ['-generated_date']
        verbose_name = 'Validation Token'
        verbose_name_plural = 'Validation Tokens'
    
    def __str__(self):
        return f"{self.user.email} - {self.token_type} - {self.generated_date.strftime('%Y-%m-%d %H:%M')}"
    
    def is_expired(self):
        """Check if the token has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if the token is valid and not expired"""
        return self.valid and not self.used and not self.is_expired()
    
    def mark_as_used(self):
        """Mark the token as used"""
        self.used = True
        self.valid = False
        self.save()
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Default expiration: 24 hours for password reset, 7 days for others
            if self.token_type == 'password_reset':
                self.expires_at = timezone.now() + timedelta(hours=24)
            else:
                self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)