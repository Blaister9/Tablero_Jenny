from django.core.management.base import BaseCommand
import pandas as pd
from maintenance.models import MaintenanceSubGroup, MaintenanceItem
from users.models import User

class Command(BaseCommand):
    help = 'Importa datos desde los archivos Excel'

    def handle(self, *args, **options):
        try:
            # Leer el Excel con los nombres de columnas en español
            df = pd.read_excel(
                r'C:\Users\santi\Documents\Tablero_Jenny\PETI-PAI-2024.xlsx',
                sheet_name='Plan Mto Infraestructura',
                skiprows=12,
                header=None,
                names=[
                    'Sub-Grupo',
                    'Ítem',
                    'Elemento',
                    'Actividad',
                    'Cantidad',
                    'Tipo de Mantenimiento',
                    'Número de Contrato',
                    'Fecha Inicio Contrato',
                    'Vigencia del Contrato',
                    'Responsable Proveedor',
                    'Responsable OASTI',
                    'Última fecha de mantenimiento'
                ]
            )

            self.stdout.write("Columnas encontradas en el Excel:")
            for col in df.columns:
                self.stdout.write(f"- {col}")

            self.stdout.write("\nPrimeras 10 filas del Excel:")
            pd.set_option('display.max_columns', None)
            pd.set_option('display.width', None)
            self.stdout.write(str(df.head(10)))

            # Mostrar los subgrupos únicos encontrados
            self.stdout.write("\nSub-Grupos encontrados:")
            subgrupos = df['Sub-Grupo'].dropna().unique()
            for subgrupo in subgrupos:
                self.stdout.write(f"- {subgrupo}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error detallado: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))