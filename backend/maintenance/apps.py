from django.apps import AppConfig

# Descripción general del código:
# Este script define la configuración de la aplicación Django llamada "maintenance".
# Especifica el campo automático predeterminado para los modelos y el nombre de la aplicación.

class MaintenanceConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'maintenance'.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'maintenance'
