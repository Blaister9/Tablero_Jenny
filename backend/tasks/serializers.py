from rest_framework import serializers
from .models import Task, StrategicLine, Area, Leader
from datetime import datetime, date

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
    area_data = AreaSerializer(source='area', read_only=True)
    leaders = LeaderSerializer(many=True, read_only=True)
    support_team = LeaderSerializer(many=True, read_only=True)
    leaders_names = serializers.SerializerMethodField()

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
            'leaders_names',
            'year',
            'assigned_to',
            'daruma_code',
            'alert_date',
            'limit_month',
            'deliverable',
            'evidence',
            'support_team'
        ]

    def get_assigned_to_name(self, obj):
        return f"{obj.assigned_to.get_full_name() or obj.assigned_to.username}"

    def get_strategic_line(self, obj):
        if obj.strategic_line:
            return obj.strategic_line.name
        return None

    def get_leader(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

    def get_leaders_names(self, obj):
        return [leader.name for leader in obj.leaders.all()]

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    strategic_line = serializers.SerializerMethodField()
    leader = serializers.SerializerMethodField()
    area_data = AreaSerializer(source='area', read_only=True)
    leaders_data = LeaderSerializer(source='leaders', read_only=True, many=True)
    support_team = serializers.PrimaryKeyRelatedField(many=True, queryset=Leader.objects.all(), required=False)
    leaders_names = serializers.SerializerMethodField()
    alert_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'], required=False)

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
            'leaders_names',
            'year',
            'assigned_to',
            'daruma_code',
            'alert_date',
            'limit_month',
            'deliverable',
            'evidence',
            'support_team'
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True}
        }
        read_only_fields = ['created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        return f"{obj.assigned_to.get_full_name() or obj.assigned_to.username}"

    def get_strategic_line(self, obj):
        if obj.strategic_line:
            return obj.strategic_line.name
        return None

    def get_leader(self, obj):
        return obj.assigned_to.get_full_name() or obj.assigned_to.username

    def get_leaders_names(self, obj):
        return [leader.name for leader in obj.leaders.all()]

    def update(self, instance, validated_data):
        support_team_data = validated_data.pop('support_team', None)
        if support_team_data is not None:
            print("Support team data received:", support_team_data)            
            instance.support_team.set(support_team_data)

        if 'alert_date' in validated_data:
            alert_date = validated_data.pop('alert_date')
            print('Fecha recibida en backend:', alert_date)
            instance.alert_date = alert_date if isinstance(alert_date, date) else datetime.strptime(alert_date, '%Y-%m-%d').date()
            print('Fecha después de guardar:', instance.alert_date)

        strategic_line = validated_data.pop('strategic_line', None)
        if isinstance(strategic_line, str):
            strategic_line_obj, _ = StrategicLine.objects.get_or_create(name=strategic_line)
            instance.strategic_line = strategic_line_obj

        leaders_data = validated_data.pop('leaders', None)
        if leaders_data is not None:
            instance.leaders.set(leaders_data)

        support_team_data = validated_data.pop('support_team', None)
        if support_team_data is not None:
            print("Support team data received:", support_team_data)
            instance.support_team.set(support_team_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['support_team'] = LeaderSerializer(instance.support_team.all(), many=True).data        
        if instance.alert_date:
            from datetime import datetime, timezone
            local_date = instance.alert_date
            data['alert_date'] = local_date.strftime('%Y-%m-%d')
        return data

class TaskCreateSerializer(serializers.ModelSerializer):
    strategic_line = serializers.CharField()

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
            'leaders',
            'support_team',
            'daruma_code',
            'alert_date',
            'limit_month',
            'deliverable',
            'evidence'
        ]

    def create(self, validated_data):
        strategic_line_name = validated_data.pop('strategic_line')
        strategic_line_obj, _ = StrategicLine.objects.get_or_create(name=strategic_line_name)
        validated_data['strategic_line'] = strategic_line_obj
        return super().create(validated_data)