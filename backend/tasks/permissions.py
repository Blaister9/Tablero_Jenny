from rest_framework import permissions
import logging
logger = logging.getLogger(__name__)

class CanManageTasks(permissions.BasePermission):
    def has_permission(self, request, view):
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
        logger.error(f"has_object_permission - método: {request.method}")
        logger.error(f"has_object_permission - datos: {request.data}")        
        # Permitir lectura a todos
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Jenny puede hacer todo
        if request.user.is_authenticated and request.user.username == 'jenny':
            return True
            
        # Cualquier usuario puede modificar solo las observaciones
        if request.method == 'PATCH' and set(request.data.keys()) == {'description'}:
            # Verificar que solo se estén modificando las observaciones o descripción
            allowed_fields = {'description', 'observations'}
            if set(request.data.keys()).issubset(allowed_fields):
                return True
                
        return False