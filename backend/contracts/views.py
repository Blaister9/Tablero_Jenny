from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import ExtractMonth
from .models import Contract
from .serializers import ContractSerializer

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = ContractSerializer

    def get_permissions(self):
        # Permisos:
        #   - GET (list, retrieve): usuario autenticado
        #   - POST, PUT, PATCH, DELETE: usuario admin
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [perm() for perm in permission_classes]

@api_view(['GET'])
@permission_classes([AllowAny])
def kpis_full_summary(request):
    qs = Contract.objects.all()

    # Filtros existentes
    anio = request.GET.get('anio')
    rubro = request.GET.get('rubro')
    contratista = request.GET.get('contratista')
    fecha_inicio_desde = request.GET.get('fecha_inicio_desde')
    fecha_inicio_hasta = request.GET.get('fecha_inicio_hasta')

    # Filtros adicionales
    grupo = request.GET.get('grupo')
    subgrupo = request.GET.get('subgrupo')
    area = request.GET.get('area')  # area_pertenece
    tipo_proceso = request.GET.get('tipo_proceso')
    sistema_pub = request.GET.get('sistema_publicacion')
    impacto = request.GET.get('impacto')
    supervisor = request.GET.get('supervisor')

    if anio:
        qs = qs.filter(anio_paa=anio)
    if rubro:
        qs = qs.filter(rubro__icontains=rubro)
    if contratista:
        qs = qs.filter(nombre_contratista__icontains=contratista)
    if fecha_inicio_desde:
        qs = qs.filter(fecha_inicio_ejecucion__gte=fecha_inicio_desde)
    if fecha_inicio_hasta:
        qs = qs.filter(fecha_inicio_ejecucion__lte=fecha_inicio_hasta)
    if grupo:
        qs = qs.filter(grupo__icontains=grupo)
    if subgrupo:
        qs = qs.filter(subgrupo__icontains=subgrupo)
    if area:
        qs = qs.filter(area_pertenece__icontains=area)
    if tipo_proceso:
        qs = qs.filter(tipo_proceso__icontains=tipo_proceso)
    if sistema_pub:
        qs = qs.filter(sistema_publicacion__icontains=sistema_pub)
    if impacto:
        qs = qs.filter(impacto__icontains=impacto)
    if supervisor:
        qs = qs.filter(supervisor_contrato__icontains=supervisor)

    total_contratos = qs.count()
    valor_total_asignado_2024 = qs.aggregate(total=Sum('valor_asignado_2024'))['total'] or 0
    valor_total_final = qs.aggregate(total=Sum('valor_total_final_contrato'))['total'] or 0
    valor_promedio_final = qs.aggregate(prom=Avg('valor_total_final_contrato'))['prom'] or 0

    # Calculo de duracion promedio
    duracion_qs = qs.filter(fecha_inicio_ejecucion__isnull=False, fecha_final__isnull=False).values('fecha_inicio_ejecucion', 'fecha_final')
    total_dias = 0
    count_contratos_con_duracion = 0
    for c in duracion_qs:
        inicio = c['fecha_inicio_ejecucion']
        fin = c['fecha_final']
        if inicio and fin:
            diff = (fin - inicio).days
            total_dias += diff
            count_contratos_con_duracion += 1

    if count_contratos_con_duracion > 0:
        duracion_promedio = total_dias / count_contratos_con_duracion
    else:
        duracion_promedio = 0

    valor_por_rubro = (qs.values('rubro')
                       .annotate(total=Sum('valor_asignado_2024'))
                       .order_by('-total')[:5])

    top_contratistas = (qs.values('nombre_contratista')
                        .annotate(count=Count('id'), valor=Sum('valor_total_final_contrato'))
                        .order_by('-valor')[:5])

    contratos_por_proceso = (qs.values('tipo_proceso')
                             .annotate(count=Count('id'))
                             .order_by('-count'))

    valor_por_mes = (qs.filter(fecha_suscripcion_contrato__isnull=False)
                     .annotate(mes=F('fecha_suscripcion_contrato__month'))
                     .values('mes')
                     .annotate(total=Sum('valor_asignado_2024'))
                     .order_by('mes'))

    # Contratos adjudicados (asumiendo 'si' = adjudicado)
    contratos_adjudicados = qs.filter(adjudicado__iexact='si').count()
    valor_ejecutado_2024 = qs.aggregate(ej=Sum('valor_ejecutado_2024_hasta_31_julio'))['ej'] or 0

    data = {
        'filtros_aplicados': {
            'anio': anio or 'todos',
            'rubro': rubro or 'todos',
            'contratista': contratista or 'todos',
            'fecha_inicio_desde': fecha_inicio_desde or 'N/A',
            'fecha_inicio_hasta': fecha_inicio_hasta or 'N/A',
            'grupo': grupo or 'todos',
            'subgrupo': subgrupo or 'todos',
            'area': area or 'todos',
            'tipo_proceso': tipo_proceso or 'todos',
            'sistema_publicacion': sistema_pub or 'todos',
            'impacto': impacto or 'todos',
            'supervisor': supervisor or 'todos',
        },
        'kpis_generales': {
            'total_contratos': total_contratos,
            'valor_total_asignado_2024': float(valor_total_asignado_2024),
            'valor_total_final': float(valor_total_final),
            'valor_promedio_final': float(valor_promedio_final),
            'duracion_promedio_dias': duracion_promedio,
            'contratos_adjudicados': contratos_adjudicados,
            'valor_ejecutado_2024': float(valor_ejecutado_2024),
        },
        'top_rubros_valor_2024': list(valor_por_rubro),
        'top_contratistas_valor': list(top_contratistas),
        'contratos_por_proceso': list(contratos_por_proceso),
        'valor_por_mes_2024': list(valor_por_mes),
    }

    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def contratistas_options(request):
    contratistas = Contract.objects.exclude(nombre_contratista__isnull=True)\
                                   .exclude(nombre_contratista__exact='')\
                                   .values_list('nombre_contratista', flat=True).distinct()
    data = [{"label": c, "value": c} for c in contratistas]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def rubros_options(request):
    rubros = Contract.objects.exclude(rubro__isnull=True)\
                             .exclude(rubro__exact='')\
                             .values_list('rubro', flat=True).distinct()
    data = [{"label": r, "value": r} for r in rubros]
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def anios_options(request):
    anios = Contract.objects.exclude(anio_paa__isnull=True)\
                            .values_list('anio_paa', flat=True).distinct()
    anios = sorted(anios)
    return Response(anios)

@api_view(['GET'])
@permission_classes([AllowAny])
def adiciones_stats(request):
    adiciones_qs = Contract.objects.filter(valor_adiciones_reducciones__gt=0)
    count_adiciones = adiciones_qs.count()
    total_adiciones = adiciones_qs.aggregate(total=Sum('valor_adiciones_reducciones'))['total'] or 0
    promedio_adiciones = total_adiciones / count_adiciones if count_adiciones > 0 else 0

    distribucion_mensual = (adiciones_qs.filter(fecha_suscripcion_contrato__isnull=False)
                            .annotate(mes=ExtractMonth('fecha_suscripcion_contrato'))
                            .values('mes')
                            .annotate(total=Sum('valor_adiciones_reducciones'))
                            .order_by('mes'))

    data = {
        'count_adiciones': count_adiciones,
        'total_adiciones': float(total_adiciones),
        'promedio_adiciones': float(promedio_adiciones),
        'distribucion_mensual': list(distribucion_mensual),
    }

    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def supervisores_stats(request):
    supervisores_qs = (Contract.objects.exclude(supervisor_contrato__isnull=True)
                       .exclude(supervisor_contrato__exact='')
                       .values('supervisor_contrato')
                       .annotate(
                           count=Count('id'),
                           valor=Sum('valor_total_final_contrato')
                       )
                       .order_by('-valor'))

    data = list(supervisores_qs)
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def sistemas_info_stats(request):
    sistemas_qs = (Contract.objects.exclude(sistema_publicacion__isnull=True)
                   .exclude(sistema_publicacion__exact='')
                   .values('sistema_publicacion')
                   .annotate(
                       count=Count('id'),
                       valor=Sum('valor_total_final_contrato')
                   )
                   .order_by('-valor'))

    data = list(sistemas_qs)
    return Response(data)


# NUEVO ENDPOINT filters-options
@api_view(['GET'])
@permission_classes([AllowAny])
def filters_options(request):
    def to_dict(values):
        return [{"label": v, "value": v} for v in values if v]

    anios = Contract.objects.exclude(anio_paa__isnull=True).values_list('anio_paa', flat=True).distinct()
    rubros = Contract.objects.exclude(rubro__isnull=True).exclude(rubro='').values_list('rubro', flat=True).distinct()
    contratistas = Contract.objects.exclude(nombre_contratista__isnull=True).exclude(nombre_contratista='').values_list('nombre_contratista', flat=True).distinct()
    grupos = Contract.objects.exclude(grupo__isnull=True).exclude(grupo='').values_list('grupo', flat=True).distinct()
    subgrupos = Contract.objects.exclude(subgrupo__isnull=True).exclude(subgrupo='').values_list('subgrupo', flat=True).distinct()
    areas = Contract.objects.exclude(area_pertenece__isnull=True).exclude(area_pertenece='').values_list('area_pertenece', flat=True).distinct()
    tipos_proceso = Contract.objects.exclude(tipo_proceso__isnull=True).exclude(tipo_proceso='').values_list('tipo_proceso', flat=True).distinct()
    sistemas_pub = Contract.objects.exclude(sistema_publicacion__isnull=True).exclude(sistema_publicacion='').values_list('sistema_publicacion', flat=True).distinct()
    impactos = Contract.objects.exclude(impacto__isnull=True).exclude(impacto='').values_list('impacto', flat=True).distinct()
    supervisores = Contract.objects.exclude(supervisor_contrato__isnull=True).exclude(supervisor_contrato='').values_list('supervisor_contrato', flat=True).distinct()

    data = {
        'anios': sorted(anios),
        'rubros': to_dict(rubros),
        'contratistas': to_dict(contratistas),
        'grupos': to_dict(grupos),
        'subgrupos': to_dict(subgrupos),
        'areas': to_dict(areas),
        'tipos_proceso': to_dict(tipos_proceso),
        'sistemas_publicacion': to_dict(sistemas_pub),
        'impactos': to_dict(impactos),
        'supervisores': to_dict(supervisores)
    }

    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def estados_stats(request):
    qs = Contract.objects.all()

    # Copiamos los mismos filtros de kpis_full_summary:
    anio = request.GET.get('anio')
    rubro = request.GET.get('rubro')
    contratista = request.GET.get('contratista')
    fecha_inicio_desde = request.GET.get('fecha_inicio_desde')
    fecha_inicio_hasta = request.GET.get('fecha_inicio_hasta')
    grupo = request.GET.get('grupo')
    subgrupo = request.GET.get('subgrupo')
    area = request.GET.get('area')
    tipo_proceso = request.GET.get('tipo_proceso')
    sistema_pub = request.GET.get('sistema_publicacion')
    impacto = request.GET.get('impacto')
    supervisor = request.GET.get('supervisor')

    if anio:
        qs = qs.filter(anio_paa=anio)
    if rubro:
        qs = qs.filter(rubro__icontains=rubro)
    if contratista:
        qs = qs.filter(nombre_contratista__icontains=contratista)
    if fecha_inicio_desde:
        qs = qs.filter(fecha_inicio_ejecucion__gte=fecha_inicio_desde)
    if fecha_inicio_hasta:
        qs = qs.filter(fecha_inicio_ejecucion__lte=fecha_inicio_hasta)
    if grupo:
        qs = qs.filter(grupo__icontains=grupo)
    if subgrupo:
        qs = qs.filter(subgrupo__icontains=subgrupo)
    if area:
        qs = qs.filter(area_pertenece__icontains=area)
    if tipo_proceso:
        qs = qs.filter(tipo_proceso__icontains=tipo_proceso)
    if sistema_pub:
        qs = qs.filter(sistema_publicacion__icontains=sistema_pub)
    if impacto:
        qs = qs.filter(impacto__icontains=impacto)
    if supervisor:
        qs = qs.filter(supervisor_contrato__icontains=supervisor)

    estados_count = {}
    # Extraer todos los valores únicos de adjudicado
    adjudicados = qs.exclude(adjudicado__isnull=True).exclude(adjudicado='').values_list('adjudicado', flat=True).distinct()
    for estado_val in adjudicados:
        count = qs.filter(adjudicado=estado_val).count()
        estados_count[estado_val] = count

    return Response(estados_count)


@api_view(['GET'])
@permission_classes([AllowAny])
def contracts_list(request):
    qs = Contract.objects.all()

    # Mismos filtros que en kpis_full_summary
    anio = request.GET.get('anio')
    rubro = request.GET.get('rubro')
    contratista = request.GET.get('contratista')
    fecha_inicio_desde = request.GET.get('fecha_inicio_desde')
    fecha_inicio_hasta = request.GET.get('fecha_inicio_hasta')
    grupo = request.GET.get('grupo')
    subgrupo = request.GET.get('subgrupo')
    area = request.GET.get('area')
    tipo_proceso = request.GET.get('tipo_proceso')
    sistema_pub = request.GET.get('sistema_publicacion')
    impacto = request.GET.get('impacto')
    supervisor = request.GET.get('supervisor')

    if anio:
        qs = qs.filter(anio_paa=anio)
    if rubro:
        qs = qs.filter(rubro__icontains=rubro)
    if contratista:
        qs = qs.filter(nombre_contratista__icontains=contratista)
    if fecha_inicio_desde:
        qs = qs.filter(fecha_inicio_ejecucion__gte=fecha_inicio_desde)
    if fecha_inicio_hasta:
        qs = qs.filter(fecha_inicio_ejecucion__lte=fecha_inicio_hasta)
    if grupo:
        qs = qs.filter(grupo__icontains=grupo)
    if subgrupo:
        qs = qs.filter(subgrupo__icontains=subgrupo)
    if area:
        qs = qs.filter(area_pertenece__icontains=area)
    if tipo_proceso:
        qs = qs.filter(tipo_proceso__icontains=tipo_proceso)
    if sistema_pub:
        qs = qs.filter(sistema_publicacion__icontains=sistema_pub)
    if impacto:
        qs = qs.filter(impacto__icontains=impacto)
    if supervisor:
        qs = qs.filter(supervisor_contrato__icontains=supervisor)

    # devolver campos básicos
    data = []
    for c in qs:
        data.append({
            'id': c.id,
            'numero_contrato': c.numero_contrato,
            'rubro': c.rubro,
            'nombre_contratista': c.nombre_contratista,
            'anio_paa': c.anio_paa,
            'valor_total_final_contrato': float(c.valor_total_final_contrato or 0),
            'adjudicado': c.adjudicado,
            'grupo': c.grupo,
            'subgrupo': c.subgrupo,
            'area_pertenece': c.area_pertenece,
            'tipo_proceso': c.tipo_proceso,
            'sistema_publicacion': c.sistema_publicacion,
            'impacto': c.impacto,
        })

    return Response(data)
