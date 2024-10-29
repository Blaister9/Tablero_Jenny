from rest_framework import serializers
from .models import MaintenanceSubGroup, MaintenanceItem, MaintenanceSchedule

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)

    class Meta:
        model = MaintenanceSchedule
        fields = ('id', 'year', 'month', 'week', 'is_scheduled', 'is_completed',
                 'completion_date', 'observations', 'updated_by', 'updated_by_name', 
                 'updated_at')
        read_only_fields = ('updated_by', 'updated_at')

class MaintenanceItemSerializer(serializers.ModelSerializer):
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
    items = MaintenanceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = MaintenanceSubGroup
        fields = ('id', 'name', 'description', 'items')