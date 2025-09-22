"""
locations/views.py
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Location, LocationUpdate
from .serializers import LocationSerializer, LocationUpdateSerializer, LocationCreateSerializer
from .permissions import CanAssignLocations, CanEditLocations

User = get_user_model()


class LocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing locations
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LocationCreateSerializer
        return LocationSerializer
    
    def get_queryset(self):
        """
        Filter locations based on user role
        """
        user = self.request.user
        
        if user.can_view_all_locations():
            return Location.objects.select_related('assigned_to', 'reported_by').all()
        elif user.is_team_lead:
            # Team leads can see locations assigned to them or their team members
            return Location.objects.filter(
                assigned_to__in=User.objects.filter(role__in=['team_lead', 'team_member'])
            ).select_related('assigned_to', 'reported_by')
        elif user.is_team_member:
            # Team members can see locations assigned to them
            return Location.objects.filter(assigned_to=user).select_related('assigned_to', 'reported_by')
        else:
            # Reporters can see locations they reported
            return Location.objects.filter(reported_by=user).select_related('assigned_to', 'reported_by')
    
    def get_permissions(self):
        """
        Set permissions based on action
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['create']:
            permission_classes = [IsAuthenticated]  # Anyone can report a location
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, CanEditLocations]
        elif self.action in ['destroy']:
            permission_classes = [IsAuthenticated, CanEditLocations]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """
        Set the reporter when creating a location
        """
        if self.request.user.is_reporter:
            serializer.save(reported_by=self.request.user)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanAssignLocations])
    def assign(self, request, pk=None):
        """
        Assign a location to a user
        """
        location = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            if user.role not in ['admin', 'team_lead', 'team_member']:
                return Response(
                    {'error': 'User must be admin, team_lead, or team_member'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            location.assigned_to = user
            location.save()
            
            # Create an update record
            LocationUpdate.objects.create(
                location=location,
                updated_by=request.user,
                update_type='assignment',
                notes=f'Location assigned to {user.get_full_name()}'
            )
            
            serializer = self.get_serializer(location)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update location status
        """
        location = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'status is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in [choice[0] for choice in Location.STATUS_CHOICES]:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = location.status
        location.status = new_status
        location.save()
        
        # Create an update record
        LocationUpdate.objects.create(
            location=location,
            updated_by=request.user,
            update_type='status_change',
            previous_status=old_status,
            new_status=new_status,
            notes=notes
        )
        
        serializer = self.get_serializer(location)
        return Response(serializer.data)


class LocationUpdateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for location updates
    """
    queryset = LocationUpdate.objects.all()
    serializer_class = LocationUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        location_id = self.kwargs.get('location_id')
        location = get_object_or_404(Location, id=location_id)
        
        # Check if user can view this location
        user = self.request.user
        if not (user.can_view_all_locations() or 
                location.assigned_to == user or 
                location.reported_by == user):
            return LocationUpdate.objects.none()
        
        return LocationUpdate.objects.filter(location=location).select_related('updated_by')
    
    def perform_create(self, serializer):
        location_id = self.kwargs.get('location_id')
        location = get_object_or_404(Location, id=location_id)
        serializer.save(location=location, updated_by=self.request.user)


class AssignLocationView(viewsets.ViewSet):
    """
    View for assigning locations
    """
    permission_classes = [IsAuthenticated, CanAssignLocations]
    
    def post(self, request, location_id):
        """
        Assign a location to a user
        """
        location = get_object_or_404(Location, id=location_id)
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            if user.role not in ['admin', 'team_lead', 'team_member']:
                return Response(
                    {'error': 'User must be admin, team_lead, or team_member'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            location.assigned_to = user
            location.save()
            
            # Create an update record
            LocationUpdate.objects.create(
                location=location,
                updated_by=request.user,
                update_type='assignment',
                notes=f'Location assigned to {user.get_full_name()}'
            )
            
            serializer = LocationSerializer(location)
            return Response(serializer.data)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )