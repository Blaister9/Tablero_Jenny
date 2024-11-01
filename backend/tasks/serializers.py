from rest_framework import serializers
from .models import Task

class TaskListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    strategic_line_name = serializers.CharField(source='strategic_line.name', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'status', 'priority', 'due_date', 'assigned_to_name', 'strategic_line_name']

    def get_assigned_to_name(self, obj):
        return f"{obj.assigned_to.get_full_name() or obj.assigned_to.username}"

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'assigned_to', 'status', 
                 'priority', 'due_date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']