"""
locations/serializers.py
"""
from rest_framework import serializers
from .models import Location, LocationUpdate
from accounts.serializers import UserSerializer


class LocationSerializer(serializers.ModelSerializer):
    """
    Serializer for Location model
    """
    assigned_to = UserSerializer(read_only=True)
    reported_by = UserSerializer(read_only=True)
    assigned_to_id = serializers.CharField(write_only=True, required=False)
    reported_by_id = serializers.CharField(write_only=True, required=False)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    is_assigned = serializers.BooleanField(read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)
    is_critical = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'id', 'name', 'address', 'city', 'state', 'zip_code',
            'latitude', 'longitude', 'status', 'status_display',
            'priority', 'priority_display', 'description',
            'estimated_customers_affected', 'assigned_to', 'assigned_to_id',
            'reported_by', 'reported_by_id', 'reporter_email', 'reporter_phone',
            'created_at', 'updated_at', 'reported_at',
            'estimated_restoration', 'actual_restoration',
            'is_assigned', 'is_resolved', 'is_critical'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """
        Create location with proper user assignment
        """
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        reported_by_id = validated_data.pop('reported_by_id', None)
        
        location = Location.objects.create(**validated_data)
        
        if assigned_to_id:
            from accounts.models import User
            try:
                assigned_user = User.objects.get(id=assigned_to_id)
                location.assigned_to = assigned_user
                location.save()
            except User.DoesNotExist:
                pass
        
        if reported_by_id:
            from accounts.models import User
            try:
                reported_user = User.objects.get(id=reported_by_id)
                location.reported_by = reported_user
                location.save()
            except User.DoesNotExist:
                pass
        
        return location


class LocationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating locations (simplified for reporters)
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'name', 'address', 'city', 'state', 'zip_code',
            'latitude', 'longitude', 'priority', 'priority_display',
            'status_display', 'description', 'estimated_customers_affected', 
            'reporter_email', 'reporter_phone'
        ]
    
    def create(self, validated_data):
        """
        Create location with reporter set from request user and auto-populate email
        """
        user = self.context['request'].user
        validated_data['reported_by'] = user
        
        # Auto-populate reporter_email from logged-in user if not provided
        if not validated_data.get('reporter_email') and user.email:
            validated_data['reporter_email'] = user.email
        
        # Clean phone number - remove all non-numeric characters
        if validated_data.get('reporter_phone'):
            validated_data['reporter_phone'] = ''.join(filter(str.isdigit, validated_data['reporter_phone']))
            
        return Location.objects.create(**validated_data)


class LocationUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for LocationUpdate model
    """
    updated_by = UserSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    update_type_display = serializers.CharField(source='get_update_type_display', read_only=True)
    
    class Meta:
        model = LocationUpdate
        fields = [
            'id', 'location', 'updated_by', 'update_type', 'update_type_display',
            'previous_status', 'new_status', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LocationAssignmentSerializer(serializers.Serializer):
    """
    Serializer for location assignment
    """
    user_id = serializers.CharField()
    
    def validate_user_id(self, value):
        from accounts.models import User
        try:
            user = User.objects.get(id=value)
            if user.role not in ['admin', 'team_lead', 'team_member']:
                raise serializers.ValidationError(
                    "User must be admin, team_lead, or team_member"
                )
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")


class LocationEditSerializer(serializers.ModelSerializer):
    """
    Serializer for editing locations (limited fields for reporters)
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Location
        fields = [
            'reporter_email', 'reporter_phone', 'status', 'status_display',
            'priority', 'priority_display', 'assigned_to'
        ]
    
    def validate_status(self, value):
        """
        For reporters, only allow changing status to 'cancelled'
        """
        user = self.context['request'].user
        if user.is_reporter and value != 'cancelled':
            raise serializers.ValidationError(
                "Reporters can only change status to 'cancelled'"
            )
        return value
    
    def validate_reporter_phone(self, value):
        """
        Clean phone number - remove all non-numeric characters
        """
        if value:
            return ''.join(filter(str.isdigit, value))
        return value
    
    def validate_assigned_to(self, value):
        """
        Validate assignment based on user role
        """
        user = self.context['request'].user
        
        # Reporters cannot assign locations
        if user.is_reporter:
            raise serializers.ValidationError(
                "Reporters cannot assign locations"
            )
        
        # Team members can only assign to themselves
        if user.is_team_member and value and value != user:
            raise serializers.ValidationError(
                "Team members can only assign locations to themselves"
            )
        
        # Team leads can only assign to team members
        if user.is_team_lead and value and not value.is_team_member:
            raise serializers.ValidationError(
                "Team leads can only assign locations to team members"
            )
        
        return value
    
    def validate_priority(self, value):
        """
        Only team leads and admins can update priority
        """
        user = self.context['request'].user
        
        # Only team leads and admins can update priority
        if not (user.is_team_lead or user.is_admin):
            raise serializers.ValidationError(
                "Only team leads and admins can update priority"
            )
        
        return value


class LocationStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating location status
    """
    status = serializers.ChoiceField(choices=Location.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_status(self, value):
        if value not in [choice[0] for choice in Location.STATUS_CHOICES]:
            raise serializers.ValidationError("Invalid status")
        return value
