"""
authentication/views.py
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from .serializers import LoginSerializer, RegisterSerializer, PasswordResetSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login view
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, email=email, password=password)
        if user:
            if user.is_active:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'role_display': user.get_role_display(),
                    }
                })
            else:
                return Response(
                    {'error': 'Account is disabled'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout view
    """
    try:
        # Delete the token
        request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        # Even if token deletion fails, we still want to logout the user
        logout(request)
        return Response({'message': 'Logged out (token cleanup failed)'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration view
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'role_display': user.get_role_display(),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_view(request):
    """
    Password reset request view
    """
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        # TODO: Implement password reset logic
        return Response({'message': 'Password reset email sent'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """
    Password reset confirmation view
    """
    # TODO: Implement password reset confirmation logic
    return Response({'message': 'Password reset confirmed'})


@api_view(['POST'])
@permission_classes([AllowAny])
def email_verification_view(request):
    """
    Email verification view
    """
    # TODO: Implement email verification logic
    return Response({'message': 'Email verified'})