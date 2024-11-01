from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.shortcuts import get_object_or_404
from .models import Task, StrategicLine
from .serializers import TaskSerializer, TaskListSerializer

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'year', 'strategic_line']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'priority']

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all()

        # Filtrar solo si los valores de los filtros no son "all"
        status = self.request.query_params.get('status', None)
        priority = self.request.query_params.get('priority', None)
        year = self.request.query_params.get('year', None)
        strategic_line_name = self.request.query_params.get('strategic_line', None)

        if status and status != 'all':
            queryset = queryset.filter(status=status)
        if priority and priority != 'all':
            queryset = queryset.filter(priority=priority)
        if year and year != 'all':
            queryset = queryset.filter(year=year)
        if strategic_line_name and strategic_line_name != 'all':
            strategic_line = get_object_or_404(StrategicLine, name=strategic_line_name)
            queryset = queryset.filter(strategic_line=strategic_line.id)

        # Filtro adicional para usuarios autenticados
        if user.is_authenticated:
            if hasattr(user, 'role') and user.role in ['admin', 'manager']:
                return queryset
            return queryset.filter(assigned_to=user)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
