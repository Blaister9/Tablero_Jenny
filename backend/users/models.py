from django.contrib.auth.models import AbstractUser
from django.db import models

# Descripción general del código:
# Este script define un modelo de usuario personalizado en Django que extiende el modelo AbstractUser.
# Agrega campos adicionales como departamento y rol, y personaliza las relaciones con los grupos y permisos.

class User(AbstractUser):
    """
    Modelo personalizado de Usuario extendiendo AbstractUser
    """
    department = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='Departamento'
    )
    role = models.CharField(
        max_length=50,
        choices=[
            ('admin', 'Administrador'),
            ('manager', 'Gestor'),
            ('employee', 'Empleado')
        ],
        default='employee',
        verbose_name='Rol'
    )

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_set',
        blank=True,
        verbose_name='Groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_permissions_set',
        blank=True,
        verbose_name='User Permissions'
    )

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        """
        Retorna el nombre completo del usuario y su rol.
        """
        return f"{self.get_full_name()} - {self.get_role_display()}"