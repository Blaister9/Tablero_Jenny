from rest_framework import serializers
from .models import Task, StrategicLine

class StrategicLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = StrategicLine
        fields = ['id', 'name', 'description']

class TaskListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    strategic_line = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()  # Agregado para mostrar el líder

    class Meta:
        model = Task
        fields = [
            'id', 
            'title',
            'description',
            'status', 
            'strategic_line',
            'due_date',
            'area',
            'assigned_to_name',
            'leader',
            'year',
            'assigned_to'
        ]

    def get_assigned_to_name(self, obj):
        return f"{obj.assigned_to.get_full_name() or obj.assigned_to.username}"

    def get_strategic_line(self, obj):
        if obj.strategic_line:
            return obj.strategic_line.name
        return None

    def get_leader(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

class TaskSerializer(serializers.ModelSerializer):
    strategic_line = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'assigned_to',
            'status',
            'priority',
            'year',
            'strategic_line',
            'due_date',
            'area',
            'support_team',
            'evidence',
            'created_at',
            'updated_at',
            'leader'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_strategic_line(self, obj):
        if obj.strategic_line:
            return obj.strategic_line.name
        return None

    def get_leader(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

    def update(self, instance, validated_data):
        # Si se proporciona strategic_line como string, buscar o crear la línea estratégica
        strategic_line = validated_data.pop('strategic_line', None)
        if isinstance(strategic_line, str):
            strategic_line_obj, _ = StrategicLine.objects.get_or_create(name=strategic_line)
            instance.strategic_line = strategic_line_obj

        return super().update(instance, validated_data)