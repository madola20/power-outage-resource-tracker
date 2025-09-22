"""
authentication/urls.py
"""
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),
    path('password-reset/', views.password_reset_view, name='password-reset'),
    path('password-reset-confirm/', views.password_reset_confirm_view, name='password-reset-confirm'),
    path('verify-email/', views.email_verification_view, name='verify-email'),
]
