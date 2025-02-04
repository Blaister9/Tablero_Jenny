from django.db import models
from django.db.models import Count, Q
from django.utils import timezone
from tasks.models import Task

# Descripción General del Código:

# Este código define un modelo de Django llamado DashboardMetrics que almacena métricas agregadas
# relacionadas con el estado de las tareas. Incluye campos para el total de tareas, tareas pendientes,
# tareas en progreso, tareas completadas y tareas vencidas. También proporciona un método para actualizar
# estas métricas automáticamente.

# Funcionalidades Principales:

# 1. Definición del Modelo de Datos:
#    - Define la estructura de la tabla DashboardMetrics en la base de datos, especificando los campos,
#      tipos de datos y valores por defecto.

# 2. Actualización Automática de Métricas (método update_metrics):
#    - Proporciona un método de clase para calcular y actualizar las métricas del dashboard
#      en función del estado actual de las tareas.
#    - Utiliza consultas a la base de datos para contar las tareas en diferentes estados.
#    - Guarda las métricas actualizadas en la base de datos.

# Clases:

# - DashboardMetrics: Modelo Django que define la estructura de la tabla DashboardMetrics en la base de datos.

# Métodos de la Clase DashboardMetrics:

# - update_metrics(cls):
#   - Método de clase para calcular y actualizar las métricas del dashboard.

class DashboardMetrics(models.Model):
    """
    Define el modelo de datos para las métricas del dashboard, especificando los campos y sus tipos.
    """
    total_tasks = models.IntegerField(default=0)
    pending_tasks = models.IntegerField(default=0)
    in_progress_tasks = models.IntegerField(default=0)
    completed_tasks = models.IntegerField(default=0)
    overdue_tasks = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    @classmethod
    def update_metrics(cls):
        """
        Método de clase que calcula y actualiza las métricas del dashboard en función del estado actual de las tareas.
        """
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