from rest_framework import serializers
from .models import MaintenanceSubGroup, MaintenanceItem, MaintenanceSchedule

# Descripción General del Código:

# Este código define los serializadores para los modelos MaintenanceSubGroup, MaintenanceItem y MaintenanceSchedule
# utilizando Django Rest Framework. Los serializadores se encargan de convertir los objetos de los modelos
# en datos JSON y viceversa, y también incluyen campos adicionales para facilitar la visualización de los datos.

# Funcionalidades Principales:

# 1. Serialización/Deserialización:
#    - Permite convertir objetos MaintenanceSubGroup, MaintenanceItem y MaintenanceSchedule
#      en representaciones JSON para ser enviados en la API.
#    - Permite convertir datos JSON recibidos en la API en objetos MaintenanceSubGroup,
#      MaintenanceItem y MaintenanceSchedule.

# 2. Campos Adicionales:
#    - Incluye campos adicionales en los serializadores para mostrar información relacionada
#      de otros modelos (nombres, etc.), lo que facilita la visualización de los datos.

# Serializadores:

# - MaintenanceScheduleSerializer: Serializador para el modelo MaintenanceSchedule.
# - MaintenanceItemSerializer: Serializador para el modelo MaintenanceItem.
# - MaintenanceSubGroupSerializer: Serializador para el modelo MaintenanceSubGroup.

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo MaintenanceSchedule, define cómo se convierten los objetos MaintenanceSchedule en JSON y viceversa.
    - updated_by_name: Campo adicional que muestra el nombre completo del usuario que actualizó la programación de mantenimiento.
    """
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)

    class Meta:
        model = MaintenanceSchedule
        fields = ('id', 'year', 'month', 'week', 'is_scheduled', 'is_completed',
                 'completion_date', 'observations', 'updated_by', 'updated_by_name', 
                 'updated_at')
        read_only_fields = ('updated_by', 'updated_at')

class MaintenanceItemSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo MaintenanceItem, define cómo se convierten los objetos MaintenanceItem en JSON y viceversa.
    - schedules: Campo que muestra la lista de programaciones de mantenimiento asociadas al elemento de mantenimiento.
    - sub_group_name: Campo adicional que muestra el nombre del subgrupo al que pertenece el elemento de mantenimiento.
    - oasti_responsible_name: Campo adicional que muestra el nombre completo del responsable de la OASTI.
    """
    schedules = MaintenanceScheduleSerializer(many=True, read_only=True)
    sub_group_name = serializers.CharField(source='sub_group.name', read_only=True)
    oasti_responsible_name = serializers.CharField(source='oasti_responsible.get_full_name', 
                                                 read_only=True)

    class Meta:
        model = MaintenanceItem
        fields = ('id', 'sub_group', 'sub_group_name', 'item_number', 'element',
                 'activity', 'quantity', 'maintenance_type', 'contract_number',
                 'contract_start_date', 'contract_duration', 'provider',
                 'oasti_responsible', 'oasti_responsible_name',
                 'last_maintenance_date', 'schedules')

class MaintenanceSubGroupSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo MaintenanceSubGroup, define cómo se convierten los objetos MaintenanceSubGroup en JSON y viceversa.
    - items: Campo que muestra la lista de elementos de mantenimiento asociados al subgrupo.
    """
    items = MaintenanceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = MaintenanceSubGroup
        fields = ('id', 'name', 'description', 'items')