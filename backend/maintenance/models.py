from django.db import models
from users.models import User
import datetime

# Descripción general del código:
# Este script define modelos de Django para la gestión de mantenimientos,
# incluyendo subgrupos de mantenimiento, items de mantenimiento y su programación.
# Se utilizan relaciones ForeignKey para vincular los modelos y se definen propiedades
# para calcular la próxima fecha de mantenimiento y el estado del mismo.

class MaintenanceSubGroup(models.Model):
    """
    Modelo para representar un subgrupo de mantenimiento.
    """
    name = models.CharField(max_length=200, verbose_name='Nombre del Sub-Grupo')
    description = models.TextField(blank=True, verbose_name='Descripción')

    class Meta:
        verbose_name = 'Sub-Grupo de Mantenimiento'
        verbose_name_plural = 'Sub-Grupos de Mantenimiento'
        ordering = ['name']

    def __str__(self):
        """
        Retorna el nombre del subgrupo para representación en string.
        """
        return self.name

class MaintenanceItem(models.Model):
    """
    Modelo para representar un item de mantenimiento.
    """
    MAINTENANCE_TYPE_CHOICES = [
        ('preventive_logic', 'Preventivo Lógico'),
        ('preventive_physical', 'Preventivo Físico'),
        ('preventive_both', 'Preventivo Físico y Lógico'),
        ('corrective', 'Correctivo'),
    ]

    sub_group = models.ForeignKey(
        MaintenanceSubGroup, 
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Sub-Grupo'
    )
    item_number = models.CharField(max_length=50, verbose_name='Ítem')
    element = models.CharField(max_length=200, verbose_name='Elemento')
    activity = models.TextField(verbose_name='Actividad', blank=True)
    quantity = models.IntegerField(verbose_name='Cantidad', default=1)
    maintenance_type = models.CharField(
        max_length=50,
        choices=MAINTENANCE_TYPE_CHOICES,
        verbose_name='Tipo de Mantenimiento'
    )
    contract_number = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='Número de Contrato'
    )
    contract_start_date = models.DateField(
        null=True, 
        blank=True,
        verbose_name='Fecha Inicio del Contrato'
    )
    contract_duration = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Vigencia del Contrato'
    )
    provider = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name='Responsable Proveedor'
    )
    oasti_responsible = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='maintained_items',
        verbose_name='Responsable OASTI'
    )
    last_maintenance_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Última fecha de mantenimiento'
    )

    @property
    def next_maintenance_date(self):
        """
        Calcula la próxima fecha de mantenimiento basada en la última fecha registrada y el tipo de mantenimiento.
        """
        if not self.last_maintenance_date:
            return None
        
        # Por defecto, 90 días después del último mantenimiento
        maintenance_interval = {
            'preventive_logic': 90,  # días
            'preventive_physical': 180,
            'preventive_both': 90,
            'corrective': None  # No aplica para correctivos
        }
        
        interval = maintenance_interval.get(self.maintenance_type)
        if not interval:
            return None
            
        return self.last_maintenance_date + timedelta(days=interval)

    def get_status_color(self):
        """
        Retorna el color según el estado del mantenimiento (verde, naranja, rojo).
        """
        if not self.last_maintenance_date:
            return 'red'
            
        days_since = (timezone.now().date() - self.last_maintenance_date).days
        if days_since > 90:
            return 'red'
        if days_since > 60:
            return 'orange'
        return 'green'

    class Meta:
        verbose_name = 'Item de Mantenimiento'
        verbose_name_plural = 'Items de Mantenimiento'
        ordering = ['sub_group', 'item_number']

    def __str__(self):
        """
        Retorna una representación string del item (número y elemento).
        """
        return f"{self.item_number} - {self.element}"

class MaintenanceSchedule(models.Model):
    """
    Modelo para representar la programación de un mantenimiento.
    """
    item = models.ForeignKey(
        MaintenanceItem,
        on_delete=models.CASCADE,
        related_name='schedules',
        verbose_name='Item'
    )
    year = models.IntegerField(
        verbose_name='Año',
        default=datetime.datetime.now().year
    )
    month = models.IntegerField(
        verbose_name='Mes',
        default=datetime.datetime.now().month
    )
    week = models.IntegerField(
        verbose_name='Semana',
        default=1
    )
    is_scheduled = models.BooleanField(default=False, verbose_name='Programado')
    is_completed = models.BooleanField(default=False, verbose_name='Completado')
    completion_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha de Realización'
    )
    observations = models.TextField(blank=True, verbose_name='Observaciones')
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='schedule_updates',
        verbose_name='Actualizado por'
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Última actualización')

    class Meta:
        verbose_name = 'Programación de Mantenimiento'
        verbose_name_plural = 'Programaciones de Mantenimiento'
        ordering = ['year', 'month', 'week']
        unique_together = ['item', 'year', 'month', 'week']

    def __str__(self):
        """
        Retorna una representación string de la programación (item, semana, mes, año).
        """
        return f"{self.item} - Semana {self.week}/{self.month}/{self.year}"



