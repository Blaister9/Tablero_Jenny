from django.db import models
from django.db.models import Count, Q
from django.utils import timezone
from tasks.models import Task

class DashboardMetrics(models.Model):
    total_tasks = models.IntegerField(default=0)
    pending_tasks = models.IntegerField(default=0)
    in_progress_tasks = models.IntegerField(default=0)
    completed_tasks = models.IntegerField(default=0)
    overdue_tasks = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    @classmethod
    def update_metrics(cls):
        now = timezone.now()
        metrics, _ = cls.objects.get_or_create(pk=1)
        
        metrics.total_tasks = Task.objects.count()
        metrics.pending_tasks = Task.objects.filter(status='pending').count()
        metrics.in_progress_tasks = Task.objects.filter(status='in_progress').count()
        metrics.completed_tasks = Task.objects.filter(status='completed').count()
        metrics.overdue_tasks = Task.objects.filter(
            Q(status__in=['pending', 'in_progress']),
            due_date__lt=now
        ).count()
        
        metrics.save()
        return metrics