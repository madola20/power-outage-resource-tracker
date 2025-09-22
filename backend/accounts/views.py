"""
accounts/views.py
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserProfileSerializer

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter queryset based on user role
        """
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        elif user.is_team_lead:
            # Team leads can see team members and reporters
            return User.objects.filter(role__in=['team_member', 'reporter'])
        else:
            # Team members and reporters can only see themselves
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current user profile
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserProfileView(viewsets.ModelViewSet):
    """
    ViewSet for user profile management
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def list(self, request, *args, **kwargs):
        """
        Get current user profile
        """
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """
        Update current user profile
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache.clear()
        
        return Response(serializer.data)