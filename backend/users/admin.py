from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Descripción general del código:
# Este script configura la interfaz de administración de Django para el modelo de usuario personalizado.
# Extiende la clase UserAdmin para personalizar la visualización, los filtros, los campos de búsqueda
# y los fieldsets en la página de administración de usuarios.

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Configuración del admin para el modelo User personalizado.
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'department', 'role', 'is_active')
    list_filter = ('is_active', 'role', 'department')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)
    
    # Añadir los campos personalizados a los fieldsets
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {'fields': ('first_name', 'last_name', 'email')}),
        ('Información Adicional', {'fields': ('department', 'role')}),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Fechas Importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'department', 'role'),
        }),
    )