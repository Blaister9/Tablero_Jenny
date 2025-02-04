from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from .models import MaintenanceSubGroup, MaintenanceItem, MaintenanceSchedule
from .serializers import (MaintenanceSubGroupSerializer, MaintenanceItemSerializer,
                        MaintenanceScheduleSerializer)

# Descripción General del Código:

# Este código implementa ViewSets de Django Rest Framework para gestionar el mantenimiento de elementos,
# organizados en subgrupos y con programaciones de mantenimiento asociadas.
# Proporciona endpoints para realizar operaciones CRUD (Crear, Leer, Actualizar, Borrar) sobre subgrupos,
# elementos de mantenimiento y programaciones de mantenimiento, así como endpoints adicionales para
# obtener estadísticas, programar mantenimientos y obtener historiales.

# Funcionalidades Principales:

# 1. Gestión de Subgrupos de Mantenimiento (MaintenanceSubGroupViewSet):
#    - Permite crear, leer, actualizar y borrar subgrupos de mantenimiento.
#    - Proporciona un endpoint para obtener estadísticas sobre un subgrupo específico,
#      como el número total de elementos, el número de mantenimientos pendientes y el número de mantenimientos completados.

# 2. Gestión de Elementos de Mantenimiento (MaintenanceItemViewSet):
#    - Permite crear, leer, actualizar y borrar elementos de mantenimiento.
#    - Proporciona filtros para buscar elementos por subgrupo, tipo de mantenimiento y responsable de la OASTI.
#    - Permite buscar elementos por elemento, actividad y número de contrato.
#    - Permite ordenar los elementos por fecha del último mantenimiento y número de elemento.
#    - Proporciona un endpoint para programar un mantenimiento para un elemento específico.
#    - Proporciona un endpoint para obtener el historial de mantenimientos de un elemento específico.

# 3. Gestión de Programaciones de Mantenimiento (MaintenanceScheduleViewSet):
#    - Permite crear, leer, actualizar y borrar programaciones de mantenimiento.
#    - Proporciona filtros para buscar programaciones por año, mes, si está programado y si está completado.
#    - Permite ordenar las programaciones por fecha de finalización y fecha de actualización.
#    - Proporciona un endpoint para obtener las programaciones de mantenimiento pendientes.
#    - Proporciona un endpoint para obtener un resumen mensual de las programaciones de mantenimiento.

# Modelos:

# - MaintenanceSubGroup: Modelo Django que representa un subgrupo de mantenimiento.
# - MaintenanceItem: Modelo Django que representa un elemento de mantenimiento.
# - MaintenanceSchedule: Modelo Django que representa una programación de mantenimiento.

# Serializadores:

# - MaintenanceSubGroupSerializer: Serializador para el modelo MaintenanceSubGroup.
# - MaintenanceItemSerializer: Serializador para el modelo MaintenanceItem.
# - MaintenanceScheduleSerializer: Serializador para el modelo MaintenanceSchedule.


class MaintenanceSubGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet de Django Rest Framework para gestionar subgrupos de mantenimiento.
    """
    queryset = MaintenanceSubGroup.objects.all()
    serializer_class = MaintenanceSubGroupSerializer
    # permission_classes = [IsAuthenticated]  # Comentar esta línea para desactivar autenticación
    
    @action(detail=True)
    def statistics(self, request, pk=None):
        """
        Retorna estadísticas sobre un subgrupo específico.
        """
        subgroup = self.get_object()
        stats = subgroup.items.aggregate(
            total_items=Count('id'),
            pending_maintenance=Count('schedules', 
                filter=Q(schedules__is_scheduled=True, schedules__is_completed=False)),
            completed_maintenance=Count('schedules', 
                filter=Q(schedules__is_completed=True))
        )
        return Response(stats)

class MaintenanceItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet de Django Rest Framework para gestionar elementos de mantenimiento.
    """
    queryset = MaintenanceItem.objects.all()
    serializer_class = MaintenanceItemSerializer
    # permission_classes = [IsAuthenticated]  # Comentar esta línea para desactivar autenticación
    filterset_fields = ['sub_group', 'maintenance_type', 'oasti_responsible']
    search_fields = ['element', 'activity', 'contract_number']
    ordering_fields = ['last_maintenance_date', 'item_number']

    @action(detail=True, methods=['post'])
    def schedule_maintenance(self, request, pk=None):
        """
        Permite programar un mantenimiento para un elemento específico.
        """
        item = self.get_object()
        serializer = MaintenanceScheduleSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(
                item=item,
                updated_by=request.user
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True)
    def maintenance_history(self, request, pk=None):
        """
        Retorna el historial de mantenimientos de un elemento específico.
        """
        item = self.get_object()
        schedules = item.schedules.all().order_by('-completion_date')
        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet de Django Rest Framework para gestionar programaciones de mantenimiento.
    """
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    # permission_classes = [IsAuthenticated]  # Comentar esta línea para desactivar autenticación
    filterset_fields = ['year', 'month', 'is_scheduled', 'is_completed']
    ordering_fields = ['completion_date', 'updated_at']

    def perform_create(self, serializer):
        """
        Guarda el usuario que creó la programación de mantenimiento.
        """
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        """
        Guarda el usuario que actualizó la programación de mantenimiento.
        """
        serializer.save(updated_by=self.request.user)

    @action(detail=False)
    def pending_maintenance(self, request):
        """
        Retorna las programaciones de mantenimiento pendientes.
        """
        pending = self.queryset.filter(
            is_scheduled=True,
            is_completed=False
        ).select_related('item').order_by('year', 'month', 'week')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def monthly_summary(self, request):
        """
        Retorna un resumen mensual de las programaciones de mantenimiento.
        """
        year = request.query_params.get('year', timezone.now().year)
        month = request.query_params.get('month', timezone.now().month)
        
        summary = self.queryset.filter(
            year=year,
            month=month
        ).aggregate(
            total=Count('id'),
            scheduled=Count('id', filter=Q(is_scheduled=True)),
            completed=Count('id', filter=Q(is_completed=True))
        )
        return Response(summary)