from django.contrib import admin
from django.db.models import Q
from django.utils import timezone
from django.utils.html import format_html
from .models import MaintenanceSubGroup, MaintenanceItem, MaintenanceSchedule

class MaintenanceStatusFilter(admin.SimpleListFilter):
    title = 'Estado de Mantenimiento'
    parameter_name = 'maintenance_status'

    def lookups(self, request, model_admin):
        return (
            ('up_to_date', 'Al día'),
            ('due_soon', 'Próximo a vencer (30 días)'),
            ('overdue', 'Vencido'),
            ('no_maintenance', 'Sin mantenimiento registrado'),
        )

    def queryset(self, request, queryset):
        today = timezone.now().date()
        if self.value() == 'up_to_date':
            return queryset.filter(last_maintenance_date__gte=today - timezone.timedelta(days=90))
        if self.value() == 'due_soon':
            return queryset.filter(
                Q(last_maintenance_date__lte=today - timezone.timedelta(days=60)) &
                Q(last_maintenance_date__gt=today - timezone.timedelta(days=90))
            )
        if self.value() == 'overdue':
            return queryset.filter(last_maintenance_date__lt=today - timezone.timedelta(days=90))
        if self.value() == 'no_maintenance':
            return queryset.filter(last_maintenance_date__isnull=True)

class ContractStatusFilter(admin.SimpleListFilter):
    title = 'Estado del Contrato'
    parameter_name = 'contract_status'

    def lookups(self, request, model_admin):
        return (
            ('with_contract', 'Con Contrato'),
            ('no_contract', 'Sin Contrato'),
            ('expired', 'Contrato Vencido'),
            ('expiring_soon', 'Contrato por Vencer'),
        )

    def queryset(self, request, model_admin):
        today = timezone.now().date()
        if self.value() == 'with_contract':
            return model_admin.get_queryset(request).exclude(contract_number='')
        if self.value() == 'no_contract':
            return model_admin.get_queryset(request).filter(contract_number='')
        if self.value() == 'expired':
            return model_admin.get_queryset(request).filter(contract_duration__lt=today)
        if self.value() == 'expiring_soon':
            return model_admin.get_queryset(request).filter(
                contract_duration__range=[today, today + timezone.timedelta(days=30)]
            )


@admin.register(MaintenanceSubGroup)
class MaintenanceSubGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'total_items', 'items_requiring_maintenance')
    search_fields = ('name', 'description')
    
    def total_items(self, obj):
        return obj.items.count()
    total_items.short_description = 'Total de Elementos'

    def items_requiring_maintenance(self, obj):
        count = obj.items.filter(
            last_maintenance_date__lt=timezone.now().date() - timezone.timedelta(days=90)
        ).count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'red' if count > 0 else 'green',
            count
        )
    items_requiring_maintenance.short_description = 'Requieren Mantenimiento'



@admin.register(MaintenanceItem)
class MaintenanceItemAdmin(admin.ModelAdmin):
    list_display = (
        'item_number',
        'element',
        'sub_group',
        'maintenance_type',
        'quantity',
        'contract_status',
        'last_maintenance_status',
        'next_maintenance_date'
    )
    list_filter = (
        MaintenanceStatusFilter,
        ContractStatusFilter,
        'sub_group',
        'maintenance_type',
        ('provider', admin.EmptyFieldListFilter),
        ('oasti_responsible', admin.RelatedOnlyFieldListFilter),
    )
    search_fields = (
        'element',
        'item_number',
        'activity',
        'contract_number',
        'provider',
        'oasti_responsible__username',
        'oasti_responsible__first_name',
        'oasti_responsible__last_name'
    )
    readonly_fields = ('next_maintenance_date',)
    ordering = ('sub_group', 'item_number')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('sub_group', 'item_number', 'element', 'quantity')
        }),
        ('Detalles de Mantenimiento', {
            'fields': (
                'maintenance_type',
                'activity',
                'last_maintenance_date',
                'next_maintenance_date'
            )
        }),
        ('Información Contractual', {
            'fields': (
                'contract_number',
                'contract_start_date',
                'contract_duration',
                'provider'
            ),
            'classes': ('collapse',)
        }),
        ('Responsables', {
            'fields': ('oasti_responsible',)
        }),
    )

    def get_next_maintenance(self, obj):
        next_date = obj.next_maintenance_date
        if not next_date:
            return format_html('<span style="color: gray;">No programado</span>')
            
        days_until = (next_date - timezone.now().date()).days
        if days_until < 0:
            return format_html(
                '<span style="color: red;">Vencido hace {} días</span>',
                abs(days_until)
            )
        elif days_until <= 30:
            return format_html(
                '<span style="color: orange;">En {} días</span>',
                days_until
            )
        return format_html(
            '<span style="color: green;">{}</span>',
            next_date.strftime('%Y-%m-%d')
        )
    get_next_maintenance.short_description = 'Próximo Mantenimiento'

    def contract_status(self, obj):
        if not obj.contract_number:
            return format_html('<span style="color: red;">Sin Contrato</span>')
        if not obj.contract_duration:
            return format_html('<span style="color: orange;">Contrato Sin Fecha</span>')
        if obj.contract_duration < timezone.now().date():
            return format_html('<span style="color: red;">Contrato Vencido</span>')
        days_remaining = (obj.contract_duration - timezone.now().date()).days
        if days_remaining <= 30:
            return format_html(
                '<span style="color: orange;">Vence en {} días</span>',
                days_remaining
            )
        return format_html('<span style="color: green;">Vigente</span>')
    contract_status.short_description = 'Estado del Contrato'

    def last_maintenance_status(self, obj):
        if not obj.last_maintenance_date:
            return format_html(
                '<span style="color: red;">Sin Mantenimiento</span>'
            )
        days_since = (timezone.now().date() - obj.last_maintenance_date).days
        if days_since > 90:
            return format_html(
                '<span style="color: red;">Vencido ({} días)</span>',
                days_since
            )
        if days_since > 60:
            return format_html(
                '<span style="color: orange;">Próximo ({} días)</span>',
                days_since
            )
        return format_html(
            '<span style="color: green;">Al día ({} días)</span>',
            days_since
        )
    last_maintenance_status.short_description = 'Estado Mantenimiento'

    actions = [
        'mark_maintenance_completed',
        'generate_maintenance_report',
        'schedule_next_maintenance',
    ]

    def mark_maintenance_completed(self, request, queryset):
        for item in queryset:
            item.last_maintenance_date = timezone.now().date()
            item.save()
            MaintenanceSchedule.objects.create(
                item=item,
                completion_date=timezone.now().date(),
                is_completed=True,
                updated_by=request.user
            )
    mark_maintenance_completed.short_description = "Marcar mantenimiento como completado"



@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = (
        'item',
        'year',
        'month',
        'week',
        'status_display',
        'completion_date',
        'updated_by'
    )
    list_filter = (
        'year',
        'month',
        'is_scheduled',
        'is_completed',
        ('completion_date', admin.DateFieldListFilter),
        'item__sub_group',
        'updated_by',
    )
    search_fields = (
        'item__element',
        'item__item_number',
        'observations',
        'updated_by__username'
    )
    raw_id_fields = ('item',)
    readonly_fields = ('updated_at',)

    def status_display(self, obj):
        if obj.is_completed:
            return format_html(
                '<span style="color: green;">Completado</span>'
            )
        if obj.is_scheduled:
            if obj.week < timezone.now().isocalendar()[1]:
                return format_html(
                    '<span style="color: red;">Atrasado</span>'
                )
            return format_html(
                '<span style="color: blue;">Programado</span>'
            )
        return format_html(
            '<span style="color: gray;">No Programado</span>'
        )
    status_display.short_description = 'Estado'