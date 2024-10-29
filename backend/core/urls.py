from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from tasks.views import TaskViewSet
from users.views import UserViewSet
from dashboard.views import DashboardViewSet
from maintenance.views import (
    MaintenanceSubGroupViewSet, 
    MaintenanceItemViewSet,
    MaintenanceScheduleViewSet
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserViewSet, basename='user')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'maintenance-groups', MaintenanceSubGroupViewSet, basename='maintenance-group')
router.register(r'maintenance-items', MaintenanceItemViewSet, basename='maintenance-item')
router.register(r'maintenance-schedules', MaintenanceScheduleViewSet, basename='maintenance-schedule')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
]