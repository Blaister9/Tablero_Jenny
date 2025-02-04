from rest_framework import permissions
import logging
logger = logging.getLogger(__name__)

# Descripción general del código:
# Este script define un permiso personalizado de Django REST Framework llamado `CanManageTasks`
# para controlar el acceso a las vistas de tareas. Permite la lectura a todos los usuarios,
# pero restringe la creación, actualización y eliminación a usuarios específicos ('jenny') o
# permite modificaciones limitadas (solo el campo 'description') a otros usuarios.

class CanManageTasks(permissions.BasePermission):
    """
    Permiso personalizado para controlar el acceso a las vistas de tareas.
    """
    def has_permission(self, request, view):
        """
        Verifica si el usuario tiene permiso para acceder a la vista.
        Permite la lectura a todos, la modificación solo a 'jenny' y el PATCH con 'description' a todos.
        """
        logger.error(f"has_permission - método: {request.method}")        
        # Permitir lectura a todos
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Para métodos que modifican, verificar si es Jenny
        if request.user.is_authenticated and request.user.username == 'jenny':
            return True
            
        # Permitir PATCH a cualquier usuario para observaciones
        if request.method == 'PATCH' and 'description' in request.data:
            return True
            
        return False

    def has_object_permission(self, request, view, obj):
        """
        Verifica si el usuario tiene permiso para acceder a un objeto específico.
        Permite la lectura a todos, la administración a usuarios 'admin' y el PATCH con 'description' a todos.
        """
        logger.error(f"has_object_permission - método: {request.method}")
        logger.error(f"has_object_permission - datos: {request.data}")        
        # Permitir lectura a todos
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Administrador puede hacer todo
        if request.user.is_authenticated and request.user.is_admin:
            return True
            
        # Cualquier usuario puede modificar solo las observaciones
        if request.method == 'PATCH' and set(request.data.keys()) == {'description'}:
            # Verificar que solo se estén modificando las observaciones o descripción
            allowed_fields = {'description', 'observations'}
            if set(request.data.keys()).issubset(allowed_fields):
                return True
                
        return False