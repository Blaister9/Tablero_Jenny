from django.contrib import admin
from .models import Task, TaskUpdate

# Descripción general del código:
# Este script configura la interfaz de administración de Django para los modelos Task y TaskUpdate.
# Define un inline para mostrar las actualizaciones de la tarea directamente en la página de administración de la tarea,
# y personaliza la visualización, los filtros y los campos de búsqueda para ambos modelos.

class TaskUpdateInline(admin.TabularInline):
    """
    Inline para mostrar las actualizaciones de la tarea en la página de administración de la tarea.
    """
    model = TaskUpdate
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('status', 'comment', 'created_by', 'created_at')
    can_delete = False

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Task.
    """
    list_display = ('title', 'assigned_to', 'status', 'priority', 'due_date', 'created_at')
    list_filter = ('status', 'priority', 'created_at', 'due_date')
    search_fields = ('title', 'description', 'assigned_to__username', 'assigned_to__email')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('assigned_to', 'created_by')
    inlines = [TaskUpdateInline]
    
    fieldsets = (
        ('Información Principal', {
            'fields': ('title', 'description')
        }),
        ('Asignación', {
            'fields': ('assigned_to', 'created_by')
        }),
        ('Estado', {
            'fields': ('status', 'priority', 'due_date')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        """
        Asigna el usuario actual como creador de la tarea al crear una nueva instancia.
        """
        if not obj.pk:  # Si es una nueva tarea
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(TaskUpdate)
class TaskUpdateAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo TaskUpdate.
    """
    list_display = ('task', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('task__title', 'comment', 'created_by__username')
    readonly_fields = ('created_at',)
    raw_id_fields = ('task', 'created_by')