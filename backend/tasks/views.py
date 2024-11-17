from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.shortcuts import get_object_or_404
from .models import Task, StrategicLine, Area, Leader
from .serializers import TaskSerializer, TaskListSerializer, TaskCreateSerializer, StrategicLineSerializer,AreaSerializer,LeaderSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from .models import Task, StrategicLine, Area, Leader
from .serializers import TaskSerializer, TaskListSerializer, TaskCreateSerializer, StrategicLineSerializer, AreaSerializer, LeaderSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 10000

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
        })

class AreaViewSet(viewsets.ModelViewSet):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [AllowAny]

class LeaderViewSet(viewsets.ModelViewSet):
    queryset = Leader.objects.filter(active=True)
    serializer_class = LeaderSerializer
    permission_classes = [AllowAny]

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'year', 'strategic_line','area']
    search_fields = ['title', 'description', 'area']
    ordering_fields = ['due_date', 'created_at', 'priority']
    pagination_class = CustomPagination

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
            queryset = queryset.filter(strategic_line__name=strategic_line_name)

        # Filtro adicional para usuarios autenticados
        if user.is_authenticated:
            if hasattr(user, 'role') and user.role in ['admin', 'manager']:
                return queryset
            return queryset.filter(assigned_to=user)

        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            # Para usuarios no autenticados, asignar un usuario por defecto
            from django.contrib.auth import get_user_model
            User = get_user_model()
            default_user = User.objects.first()  # O la lógica que prefieras
            serializer.save(created_by=default_user)

    @action(detail=False, methods=['get'])
    def strategic_lines(self, request):
        queryset = StrategicLine.objects.all()
        serializer = StrategicLineSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def areas(self, request):
        areas = Area.objects.all()
        serializer = AreaSerializer(areas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leaders(self, request):
        leaders = Leader.objects.filter(active=True)
        serializer = LeaderSerializer(leaders, many=True)
        return Response(serializer.data)

class StrategicLineViewSet(viewsets.ModelViewSet):
    queryset = StrategicLine.objects.all()
    serializer_class = StrategicLineSerializer
    permission_classes = [AllowAny]

