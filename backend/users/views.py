from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserListSerializer

# Descripción general del código:
# Este script define un ViewSet de Django REST Framework para gestionar la API de usuarios.
# Utiliza autenticación para proteger las vistas y proporciona una acción personalizada para
# obtener la información del usuario autenticado actual.

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el modelo User.
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Retorna el serializador apropiado según la acción (listado o detalle).
        """
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """
        Retorna la información del usuario autenticado actual.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)