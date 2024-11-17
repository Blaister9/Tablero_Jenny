from rest_framework import serializers
from .models import Task, StrategicLine, Area, Leader


class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'name', 'description']

class LeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leader
        fields = ['id', 'name', 'role', 'active']

class StrategicLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = StrategicLine
        fields = ['id', 'name', 'description']

class TaskListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    strategic_line = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()
    area_data = AreaSerializer(source='area', read_only=True)  # Esto es importante
    leaders = LeaderSerializer(many=True, read_only=True)

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
            'area_data',  # Añadimos esto
            'assigned_to_name',
            'leader',
            'leaders',
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
    assigned_to_name = serializers.SerializerMethodField()
    strategic_line = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()
    area_data = AreaSerializer(source='area', read_only=True)
    leaders_data = LeaderSerializer(source='leaders', read_only=True, many=True)

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
            'area_data',
            'assigned_to_name',
            'leader',
            'leaders',
            'leaders_data',
            'year',
            'assigned_to'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        return f"{obj.assigned_to.get_full_name() or obj.assigned_to.username}"

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

        # Manejar los líderes si se proporcionan
        leaders_data = validated_data.pop('leaders', None)
        if leaders_data is not None:
            instance.leaders.set(leaders_data)

        # Actualizar el resto de campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

class TaskCreateSerializer(serializers.ModelSerializer):
    strategic_line = serializers.CharField()  # Cambiar a CharField

    def create(self, validated_data):
        strategic_line_name = validated_data.pop('strategic_line')
        strategic_line_obj, _ = StrategicLine.objects.get_or_create(name=strategic_line_name)
        validated_data['strategic_line'] = strategic_line_obj
        return super().create(validated_data)

    class Meta:
        model = Task
        fields = [
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
            'evidence'
        ]

