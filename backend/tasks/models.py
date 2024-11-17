from django.db import models
from django.conf import settings


class Area(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nombre')
    description = models.TextField(blank=True, verbose_name='Descripción')

    class Meta:
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'

    def __str__(self):
        return self.name

class Leader(models.Model):
    name = models.CharField(max_length=100, verbose_name='Nombre')
    role = models.CharField(max_length=100, verbose_name='Rol', blank=True)
    active = models.BooleanField(default=True, verbose_name='Activo')

    class Meta:
        verbose_name = 'Líder'
        verbose_name_plural = 'Líderes'
        ordering = ['name']

    def __str__(self):
        return self.name

class StrategicLine(models.Model):
    name = models.CharField(max_length=100, verbose_name='Línea')
    description = models.TextField(blank=True, verbose_name='Descripción')

    class Meta:
        verbose_name = 'Línea Estratégica'
        verbose_name_plural = 'Líneas Estratégicas'

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('En proceso', 'En Proceso'),
        ('Cumplido', 'Cumplido'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta')
    ]

    # Campos existentes
    title = models.CharField(max_length=900, verbose_name='Título/Meta')
    description = models.TextField(verbose_name='Descripción')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_tasks',
        verbose_name='Asignado a'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_tasks',
        verbose_name='Creado por'
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Estado'
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name='Prioridad'
    )    
    # Nuevos campos para seguimiento estratégico
    year = models.IntegerField(verbose_name='Año', default=2024)
    strategic_line = models.ForeignKey(
        StrategicLine,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks',
        verbose_name='Línea Estratégica'
    )
    alert_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha alarma'
    )
    limit_month = models.IntegerField(verbose_name='Mes límite', null=True, blank=True)
    due_date = models.DateTimeField(verbose_name='Fecha límite')
    deliverable = models.TextField(verbose_name='Entregable/Acción', blank=True)
    evidence = models.TextField(blank=True, verbose_name='Evidencia')    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Última actualización')
    area = models.ForeignKey(Area, on_delete=models.PROTECT, verbose_name='Área',null=True,blank=True)
    leaders = models.ManyToManyField(Leader,related_name='tasks_as_leader',verbose_name='Líderes')
    support_team = models.ManyToManyField(Leader,related_name='tasks_as_support',verbose_name='Equipo de Apoyo',blank=True)
    class Meta:
        verbose_name = 'Tarea/Meta'
        verbose_name_plural = 'Tareas/Metas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

class TaskUpdate(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='updates',
        verbose_name='Tarea'
    )
    comment = models.TextField(verbose_name='Comentario')
    status = models.CharField(
        max_length=50,
        choices=Task.STATUS_CHOICES,
        verbose_name='Estado'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Creado por'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name='Fecha de creación'
    )

    class Meta:
        verbose_name = 'Actualización de Tarea'
        verbose_name_plural = 'Actualizaciones de Tareas'
        ordering = ['-created_at']

    def __str__(self):
        return f"Actualización de {self.task.title} - {self.created_at}"

