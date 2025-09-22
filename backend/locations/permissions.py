"""
locations/permissions.py
"""
from rest_framework import permissions


class CanAssignLocations(permissions.BasePermission):
    """
    Permission to check if user can assign locations
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_assign_locations()
        )


class CanEditLocations(permissions.BasePermission):
    """
    Permission to check if user can edit locations
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.can_edit_locations()
        )
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user can edit specific location
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins and team leads can edit any location
        if request.user.can_edit_locations():
            return True
        
        # Team members can edit locations assigned to them
        if request.user.is_team_member and obj.assigned_to == request.user:
            return True
        
        # Reporters can edit locations they reported (limited fields)
        if request.user.is_reporter and obj.reported_by == request.user:
            return True
        
        return False


class CanViewLocation(permissions.BasePermission):
    """
    Permission to check if user can view a specific location
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admins can view all locations
        if request.user.can_view_all_locations():
            return True
        
        # Team leads can view locations assigned to them or their team members
        if request.user.is_team_lead:
            return obj.assigned_to == request.user or (
                obj.assigned_to and obj.assigned_to.role == 'team_member'
            )
        
        # Team members can view locations assigned to them
        if request.user.is_team_member:
            return obj.assigned_to == request.user
        
        # Reporters can view locations they reported
        if request.user.is_reporter:
            return obj.reported_by == request.user
        
        return False
