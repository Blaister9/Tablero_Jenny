from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from datetime import timedelta
from tasks.models import Task
from .models import DashboardMetrics

# Descripción General del Código:

# Este código implementa un ViewSet de Django Rest Framework llamado DashboardViewSet
# para proporcionar endpoints que retornan datos para construir dashboards relacionados con la gestión de tareas.
# Los endpoints calculan métricas sobre el rendimiento de los usuarios, la distribución de la carga de trabajo,
# las tendencias de finalización de tareas, la eficiencia de los departamentos y la distribución de prioridades.

# Funcionalidades Principales:

# 1. Métricas de Rendimiento del Usuario (user_performance):
#    - Calcula y retorna métricas sobre el rendimiento de los usuarios en los últimos 30 días, como:
#      - Total de tareas asignadas
#      - Tareas completadas
#      - Tareas pendientes
#      - Tareas en progreso
#      - Tareas vencidas
#      - Tasa de finalización
#    - Permite ordenar los resultados por tasa de finalización.

# 2. Distribución de la Carga de Trabajo (workload_distribution):
#    - Calcula y retorna la distribución de la carga de trabajo entre los usuarios, mostrando:
#      - Total de tareas pendientes/en progreso
#      - Tareas de alta prioridad
#      - Tareas de prioridad media
#      - Tareas de baja prioridad
#    - Permite ordenar los resultados por total de tareas pendientes.

# 3. Tendencias de Finalización de Tareas (task_completion_trends):
#    - Calcula y retorna las tendencias de creación y finalización de tareas en un período de tiempo especificado.
#    - Permite especificar el número de días a considerar como un parámetro de consulta.

# 4. Eficiencia de los Departamentos (department_efficiency):
#    - Calcula y retorna la eficiencia de los departamentos, mostrando:
#      - Total de tareas asignadas
#      - Tareas completadas a tiempo
#      - Tareas completadas tarde
#      - Tasa de eficiencia (tareas completadas a tiempo / total de tareas)
#    - Excluye los departamentos con nombre vacío.

# 5. Distribución de Prioridades (priority_distribution):
#    - Calcula y retorna la distribución de las tareas por prioridad y estado.
#    - Reorganiza los datos para facilitar la visualización en un dashboard.

# Tecnologías Utilizadas:

# - Django: Framework web de alto nivel para construir aplicaciones web en Python.
# - Django Rest Framework: Toolkit poderoso y flexible para construir APIs RESTful.

# Modelos:

# - Task: Modelo Django que representa una tarea.

# Permisos:

# - IsAuthenticated: Permite el acceso solo a usuarios autenticados.

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet de Django Rest Framework que proporciona endpoints para obtener datos para dashboards relacionados con la gestión de tareas.
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_performance(self, request):
        """
        Retorna métricas sobre el rendimiento de los usuarios en los últimos 30 días.
        """
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)
        
        user_stats = Task.objects.filter(
            created_at__gte=thirty_days_ago
        ).values(
            'assigned_to__username',
            'assigned_to__first_name',
            'assigned_to__last_name',
            'assigned_to__department'
        ).annotate(
            total_tasks=Count('id'),
            completed_tasks=Count('id', filter=Q(status='completed')),
            pending_tasks=Count('id', filter=Q(status='pending')),
            in_progress_tasks=Count('id', filter=Q(status='in_progress')),
            overdue_tasks=Count('id', filter=Q(
                status__in=['pending', 'in_progress'],
                due_date__lt=now
            )),
            completion_rate=ExpressionWrapper(
                Count('id', filter=Q(status='completed')) * 100.0 / Count('id'),
                output_field=fields.FloatField()
            )
        ).order_by('-completion_rate')

        return Response(user_stats)

    @action(detail=False, methods=['get'])
    def workload_distribution(self, request):
        """
        Retorna la distribución de la carga de trabajo entre los usuarios.
        """
        user_workload = Task.objects.filter(
            status__in=['pending', 'in_progress']
        ).values(
            'assigned_to__username',
            'assigned_to__first_name',
            'assigned_to__last_name'
        ).annotate(
            total_pending=Count('id'),
            high_priority=Count('id', filter=Q(priority='high')),
            medium_priority=Count('id', filter=Q(priority='medium')),
            low_priority=Count('id', filter=Q(priority='low')),
        ).order_by('-total_pending')

        return Response(user_workload)

    @action(detail=False, methods=['get'])
    def task_completion_trends(self, request):
        """
        Retorna las tendencias de creación y finalización de tareas en un período de tiempo especificado.
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        trends = Task.objects.filter(
            created_at__gte=start_date
        ).extra(
            select={'date': "DATE(created_at)"}
        ).values('date').annotate(
            created=Count('id'),
            completed=Count('id', filter=Q(status='completed')),
        ).order_by('date')

        return Response(list(trends))

    @action(detail=False, methods=['get'])
    def department_efficiency(self, request):
        """
        Retorna la eficiencia de los departamentos.
        """
        departments = Task.objects.values(
            'assigned_to__department'
        ).annotate(
            total_tasks=Count('id'),
            completed_on_time=Count('id', filter=Q(
                status='completed',
                updated_at__lte=F('due_date')
            )),
            completed_late=Count('id', filter=Q(
                status='completed',
                updated_at__gt=F('due_date')
            )),
            efficiency_rate=ExpressionWrapper(
                Count('id', filter=Q(
                    status='completed',
                    updated_at__lte=F('due_date')
                )) * 100.0 / Count('id'),
                output_field=fields.FloatField()
            )
        ).exclude(assigned_to__department='')

        return Response(list(departments))

    @action(detail=False, methods=['get'])
    def priority_distribution(self, request):
        """
        Retorna la distribución de las tareas por prioridad y estado.
        """
        distribution = Task.objects.values(
            'priority',
            'status'
        ).annotate(
            count=Count('id')
        ).order_by('priority', 'status')

        # Reorganizar datos para mejor visualización
        priority_data = {}
        for item in distribution:
            if item['priority'] not in priority_data:
                priority_data[item['priority']] = {
                    'total': 0,
                    'by_status': {}
                }
            priority_data[item['priority']]['by_status'][item['status']] = item['count']
            priority_data[item['priority']]['total'] += item['count']

        return Response(priority_data)