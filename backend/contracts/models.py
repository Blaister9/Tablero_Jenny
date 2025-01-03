from django.db import models

class Contract(models.Model):
    num_total = models.IntegerField(blank=True, null=True)
    num = models.IntegerField(blank=True, null=True)
    codigo_unspsc = models.CharField(max_length=255, blank=True, null=True)
    rubro = models.CharField(max_length=255, blank=True, null=True)
    descripcion_rubro = models.TextField(blank=True, null=True)
    grupo = models.CharField(max_length=255, blank=True, null=True)
    subgrupo = models.CharField(max_length=255, blank=True, null=True)
    detalle = models.TextField(blank=True, null=True)
    pertenece_a_la_oasti = models.CharField(max_length=255, blank=True, null=True)
    area_pertenece = models.CharField(max_length=255, blank=True, null=True)
    anio_paa = models.IntegerField(blank=True, null=True)
    linea_paa = models.CharField(max_length=255, blank=True, null=True)
    contratado_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    adjudicado = models.CharField(max_length=255, blank=True, null=True)
    supervisor_contrato = models.CharField(max_length=255, blank=True, null=True)
    apoyo_supervision = models.CharField(max_length=255, blank=True, null=True)
    fecha_designacion_supervision = models.DateField(blank=True, null=True)
    impacto = models.CharField(max_length=255, blank=True, null=True)
    sistema_publicacion = models.CharField(max_length=255, blank=True, null=True)
    nombre_contratista = models.CharField(max_length=255, blank=True, null=True)
    objeto = models.TextField(blank=True, null=True)
    numero_proceso = models.CharField(max_length=255, blank=True, null=True)
    numero_contrato = models.CharField(max_length=255, blank=True, null=True)
    fecha_suscripcion_contrato = models.DateField(blank=True, null=True)
    fecha_aprobacion_poliza = models.DateField(blank=True, null=True)
    fecha_inicio_ejecucion = models.DateField(blank=True, null=True)
    fecha_final = models.DateField(blank=True, null=True)
    fecha_inicio_servicio = models.DateField(blank=True, null=True)
    fecha_final_servicio = models.DateField(blank=True, null=True)
    fuente_vigencia = models.CharField(max_length=255, blank=True, null=True)
    modalidad_presentacion_general_cuadro = models.CharField(max_length=255, blank=True, null=True)
    tipo_proceso = models.CharField(max_length=255, blank=True, null=True)
    valor_total_inicial_contrato = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    valor_adiciones_reducciones = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    valor_total_final_contrato = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    valor_antes_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    valor_asignado_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    valor_despues_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    valor_total_asignado_paa_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    diferencia_contratado_respecto_paa = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    liberaciones_cdp = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    cantidad_pagos_2024_hasta_31_julio = models.IntegerField(blank=True, null=True)
    valor_ejecutado_2024_hasta_31_julio = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    pago_mensual_aproximado = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    porcentaje_ejecucion_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    presupuesto_pendiente_2024 = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    expediente_gestion_documental = models.CharField(max_length=255, blank=True, null=True)
    url_secop_tv = models.URLField(blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Contrato {self.numero_contrato or self.num or 'sin num'}"
