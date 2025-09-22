"""
locations/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('<str:location_id>/updates/', views.LocationUpdateViewSet.as_view({'get': 'list', 'post': 'create'}), name='location-updates'),
    path('assign/<str:location_id>/', views.AssignLocationView.as_view({'post': 'post'}), name='assign-location'),
]
