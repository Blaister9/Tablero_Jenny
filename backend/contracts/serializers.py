from rest_framework import serializers
from .models import Contract

# Descripción General del Código:

# Este código define un serializador para el modelo Contract utilizando Django Rest Framework.
# El serializador se encarga de convertir los objetos Contract en datos JSON y viceversa,
# y también incluye validaciones personalizadas para asegurar la integridad de los datos.

# Funcionalidades Principales:

# 1. Serialización/Deserialización:
#    - Permite convertir objetos Contract en representaciones JSON para ser enviados en la API.
#    - Permite convertir datos JSON recibidos en la API en objetos Contract.

# 2. Validaciones Personalizadas:
#    - Incluye validaciones personalizadas para asegurar que los datos del contrato sean coherentes:
#      - El año PAA debe ser mayor a 2000.
#      - El valor total final no puede ser menor que el valor total inicial.

# Clases:

# - ContractSerializer: Serializador para el modelo Contract.

# Métodos del Serializador:

# - validate(self, attrs):
#   - Realiza validaciones personalizadas sobre los datos del contrato.
#   - Recibe un diccionario con los atributos del contrato.
#   - Lanza una excepción `serializers.ValidationError` si alguna de las validaciones falla.
#   - Retorna el diccionario de atributos validados si todas las validaciones pasan.

class ContractSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Contract, define cómo se convierten los objetos Contract en JSON y viceversa.
    """
    class Meta:
        """
        Define metadatos para el serializador, como el modelo al que se asocia (Contract) y los campos que se incluirán en la serialización ('__all__' incluye todos los campos).
        """
        model = Contract
        fields = '__all__'

    def validate(self, attrs):
        """
        Método para realizar validaciones personalizadas sobre los datos del contrato antes de que sean guardados en la base de datos.
        """
        anio = attrs.get('anio_paa')
        if anio is not None and anio < 2000:
            raise serializers.ValidationError("El año PAA debe ser mayor a 2000.")

        inicial = attrs.get('valor_total_inicial_contrato')
        final = attrs.get('valor_total_final_contrato')
        if inicial is not None and final is not None:
            if final < inicial:
                raise serializers.ValidationError("El valor total final no puede ser menor que el inicial.")

        return attrs
