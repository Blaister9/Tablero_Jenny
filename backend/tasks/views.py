from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status
from django.shortcuts import get_object_or_404
from .models import Task, StrategicLine, Area, Leader
from .serializers import (
    TaskSerializer, 
    TaskListSerializer, 
    TaskCreateSerializer, 
    StrategicLineSerializer,
    AreaSerializer,
    LeaderSerializer
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db import models
from .permissions import CanManageTasks
import logging
logger = logging.getLogger(__name__)

# Descripción general del código:
# Este script define ViewSets de Django REST Framework para gestionar las APIs relacionadas con tareas,
# líneas estratégicas, áreas y líderes. Utiliza serializadores para la conversión de datos,
# permisos personalizados para controlar el acceso, y paginación personalizada para la gestión de resultados.
# Incluye filtros, búsqueda y ordenamiento para las tareas.

class CustomPagination(PageNumberPagination):
    """
    Paginación personalizada con tamaño de página configurable y metadatos adicionales.
    """
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 10000

    def get_paginated_response(self, data):
        """
        Retorna la respuesta paginada con información adicional como total de páginas y página actual.
        """
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
        })

class AreaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo Area (solo lectura).
    """
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get']  # Solo permitir lectura

class LeaderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo Leader (solo lectura de líderes activos).
    """
    queryset = Leader.objects.filter(active=True)
    serializer_class = LeaderSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get']  # Solo permitir lectura

class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo Task con permisos, filtros, búsqueda, ordenamiento y paginación.
    """
    permission_classes = [CanManageTasks]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'year', 'area','leaders', 'support_team']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'priority']
    pagination_class = CustomPagination

    def get_queryset(self):
        """
        Obtiene el conjunto de tareas, aplicando filtros por línea estratégica, líderes y equipo de soporte. 
        Permite a 'jenny' ver todas las tareas.
        """
        queryset = Task.objects.all()
        strategic_line_name = self.request.query_params.get('strategic_line', None)

        if strategic_line_name and strategic_line_name != 'all':
            queryset = queryset.filter(strategic_line__name=strategic_line_name)

        # Nuevos filtros múltiples para líderes y equipo de soporte
        leaders = self.request.query_params.getlist('leaders[]', [])
        support_team = self.request.query_params.getlist('support_team[]', [])

        if leaders:
            queryset = queryset.filter(leaders__id__in=leaders).distinct()
            
        if support_team:
            queryset = queryset.filter(support_team__id__in=support_team).distinct()        

        # Si el usuario está autenticado y es Jenny, puede ver todo
        # Si no está autenticado o no es Jenny, también puede ver todo
        return queryset

    def get_serializer_class(self):
        """
        Retorna el serializador apropiado según la acción (creación, listado, detalle).
        """
        if self.action == 'create':
            return TaskCreateSerializer
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    
    def perform_update(self, serializer):
        """
        Actualiza una tarea, permitiendo solo a 'jenny' modificar todos los campos o a otros usuarios solo la descripción.
        """
        logger.error("==== UPDATE DEBUG ====")
        logger.error(f"Request method: {self.request.method}")
        logger.error(f"Request data: {self.request.data}")
        logger.error(f"Request headers: {self.request.headers}")
        logger.error("==== END UPDATE DEBUG ====")

        if self.request.user.is_authenticated and self.request.user.username == 'jenny':
            serializer.save()
        elif set(self.request.data.keys()) == {'description'}:
            serializer.save()
        else:
            return Response(
                {"detail": "Solo puedes modificar el campo de descripción."},
                status=status.HTTP_403_FORBIDDEN
            )
    
    def perform_destroy(self, instance):
        """
        Elimina una tarea, permitiendo solo a 'jenny' realizar esta acción.
        """
        # Solo Jenny puede eliminar tareas
        if self.request.user.is_authenticated and self.request.user.username == 'jenny':
            instance.delete()
        else:
            return Response(
                {"detail": "Solo Jenny puede eliminar tareas."},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=False, methods=['get'])
    def strategic_lines(self, request):
        """
        Retorna una lista de líneas estratégicas.
        """
        queryset = StrategicLine.objects.all()
        serializer = StrategicLineSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def areas(self, request):
        """
        Retorna una lista de áreas.
        """
        areas = Area.objects.all()
        serializer = AreaSerializer(areas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leaders(self, request):
        """
        Retorna una lista de líderes activos.
        """
        leaders = Leader.objects.filter(active=True)
        serializer = LeaderSerializer(leaders, many=True)
        return Response(serializer.data)

class StrategicLineViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo StrategicLine (solo lectura).
    """
    queryset = StrategicLine.objects.all()
    serializer_class = StrategicLineSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get']  # Solo permitir lectura