# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

# Descripción general del código:
# Este script define Serializers de Django REST Framework para el modelo User.
# Incluye un serializador para la creación de usuarios con validación de contraseña
# y otro para el listado de usuarios con campos específicos.

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo User, incluye la contraseña y la valida durante la creación.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 
                 'last_name', 'department', 'role')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Crea un nuevo usuario utilizando el método `create_user`.
        """
        user = User.objects.create_user(**validated_data)
        return user

class UserListSerializer(serializers.ModelSerializer):
    """
    Serializador para el listado de usuarios, excluye la contraseña.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'department', 'role')