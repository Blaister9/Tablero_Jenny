from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from .models import MaintenanceSubGroup, MaintenanceItem, MaintenanceSchedule
from .serializers import (MaintenanceSubGroupSerializer, MaintenanceItemSerializer,
                        MaintenanceScheduleSerializer)

class MaintenanceSubGroupViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSubGroup.objects.all()
    serializer_class = MaintenanceSubGroupSerializer
    # permission_classes = [IsAuthenticated]  # Comentar esta línea para desactivar autenticación
    
    @action(detail=True)
    def statistics(self, request, pk=None):
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
    queryset = MaintenanceItem.objects.all()
    serializer_class = MaintenanceItemSerializer
    # permission_classes = [IsAuthenticated]  # Comentar esta línea para desactivar autenticación
    filterset_fields = ['sub_group', 'maintenance_type', 'oasti_responsible']
    search_fields = ['element', 'activity', 'contract_number']
    ordering_fields = ['last_maintenance_date', 'item_number']

    @action(detail=True, methods=['post'])
    def schedule_maintenance(self, request, pk=None):
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
        item = self.get_object()
        schedules = item.schedules.all().order_by('-completion_date')
        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    # permission_classes = [IsAuthenticated]  # Comentar esta línea para desactivar autenticación
    filterset_fields = ['year', 'month', 'is_scheduled', 'is_completed']
    ordering_fields = ['completion_date', 'updated_at']

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False)
    def pending_maintenance(self, request):
        pending = self.queryset.filter(
            is_scheduled=True,
            is_completed=False
        ).select_related('item').order_by('year', 'month', 'week')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def monthly_summary(self, request):
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