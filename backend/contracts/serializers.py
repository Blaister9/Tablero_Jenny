from rest_framework import serializers
from .models import Contract

class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = '__all__'

    def validate(self, attrs):
        anio = attrs.get('anio_paa')
        if anio is not None and anio < 2000:
            raise serializers.ValidationError("El año PAA debe ser mayor a 2000.")

        inicial = attrs.get('valor_total_inicial_contrato')
        final = attrs.get('valor_total_final_contrato')
        if inicial is not None and final is not None:
            if final < inicial:
                raise serializers.ValidationError("El valor total final no puede ser menor que el inicial.")

        return attrs
