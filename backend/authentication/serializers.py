"""
authentication/serializers.py
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from accounts.serializers import UserRegistrationSerializer

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField()


class RegisterSerializer(UserRegistrationSerializer):
    """
    Serializer for user registration
    """
    pass


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    """
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation
    """
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification
    """
    token = serializers.CharField()
