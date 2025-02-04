from django.db import models

# Descripción General del Código:

# Este código define el modelo Contract utilizando Django ORM (Object-Relational Mapper).
# El modelo Contract representa la estructura de la tabla de contratos en la base de datos.
# Cada campo del modelo corresponde a una columna en la tabla.

# Funcionalidades Principales:

# 1. Definición del Modelo de Datos:
#    - Define la estructura de la tabla de contratos en la base de datos, especificando los campos,
#      tipos de datos y restricciones (como `blank=True` y `null=True` para permitir campos vacíos).

# 2. Representación en Cadena (método __str__):
#    - Define cómo se representa un objeto Contract como una cadena de texto, lo que facilita la depuración
#      y la visualización de los datos.

# Clases:

# - Contract: Modelo Django que define la estructura de la tabla de contratos en la base de datos.

# Campos del Modelo:

# - num_total: Entero (Integer)
# - num: Entero (Integer)
# - codigo_unspsc: Cadena de texto (CharField)
# - rubro: Cadena de texto (CharField)
# - descripcion_rubro: Texto largo (TextField)
# - grupo: Cadena de texto (CharField)
# - subgrupo: Cadena de texto (CharField)
# - detalle: Texto largo (TextField)
# - pertenece_a_la_oasti: Cadena de texto (CharField)
# - area_pertenece: Cadena de texto (CharField)
# - anio_paa: Entero (Integer)
# - linea_paa: Cadena de texto (CharField)
# - contratado_2024: Decimal (DecimalField)
# - adjudicado: Cadena de texto (CharField)
# - supervisor_contrato: Cadena de texto (CharField)
# - apoyo_supervision: Cadena de texto (CharField)
# - fecha_designacion_supervision: Fecha (DateField)
# - impacto: Cadena de texto (CharField)
# - sistema_publicacion: Cadena de texto (CharField)
# - nombre_contratista: Cadena de texto (CharField)
# - objeto: Texto largo (TextField)
# - numero_proceso: Cadena de texto (CharField)
# - numero_contrato: Cadena de texto (CharField)
# - fecha_suscripcion_contrato: Fecha (DateField)
# - fecha_aprobacion_poliza: Fecha (DateField)
# - fecha_inicio_ejecucion: Fecha (DateField)
# - fecha_final: Fecha (DateField)
# - fecha_inicio_servicio: Fecha (DateField)
# - fecha_final_servicio: Fecha (DateField)
# - fuente_vigencia: Cadena de texto (CharField)
# - modalidad_presentacion_general_cuadro: Cadena de texto (CharField)
# - tipo_proceso: Cadena de texto (CharField)
# - valor_total_inicial_contrato: Decimal (DecimalField)
# - valor_adiciones_reducciones: Decimal (DecimalField)
# - valor_total_final_contrato: Decimal (DecimalField)
# - valor_antes_2024: Decimal (DecimalField)
# - valor_asignado_2024: Decimal (DecimalField)
# - valor_despues_2024: Decimal (DecimalField)
# - valor_total_asignado_paa_2024: Decimal (DecimalField)
# - diferencia_contratado_respecto_paa: Decimal (DecimalField)
# - liberaciones_cdp: Decimal (DecimalField)
# - cantidad_pagos_2024_hasta_31_julio: Entero (Integer)
# - valor_ejecutado_2024_hasta_31_julio: Decimal (DecimalField)
# - pago_mensual_aproximado: Decimal (DecimalField)
# - porcentaje_ejecucion_2024: Decimal (DecimalField)
# - presupuesto_pendiente_2024: Decimal (DecimalField)
# - expediente_gestion_documental: Cadena de texto (CharField)
# - url_secop_tv: URL (URLField)
# - observaciones: Texto largo (TextField)

class Contract(models.Model):
    """
    Define el modelo de datos para los contratos, especificando los campos y sus tipos.
    """
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
        """
        Define cómo se representa un objeto Contract como una cadena de texto, facilitando la depuración y la visualización de los datos.
        """
        return f"Contrato {self.numero_contrato or self.num or 'sin num'}"
