from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from datetime import timedelta
from tasks.models import Task
from .models import DashboardMetrics

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_performance(self, request):
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