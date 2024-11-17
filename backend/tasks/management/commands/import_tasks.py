import pandas as pd
from django.core.management.base import BaseCommand
from tasks.models import Task, StrategicLine, Area, Leader
from django.contrib.auth import get_user_model
import pytz
from datetime import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Import tasks from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='The path to the Excel file')
        parser.add_argument('--clean', action='store_true', help='Limpiar datos existentes antes de importar')

    def clean_database(self):
        """Limpia todos los datos existentes"""
        self.stdout.write("Limpiando base de datos...")
        Task.objects.all().delete()
        Leader.objects.all().delete()
        Area.objects.all().delete()
        StrategicLine.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Base de datos limpiada exitosamente"))

    def create_leader_from_text(self, leader_text):
        """Crea líderes a partir de texto, manejando múltiples nombres"""
        if not leader_text or pd.isna(leader_text):
            return []
        
        leaders = []
        # Dividir por comas y limpiar espacios
        names = [name.strip() for name in str(leader_text).split(',')]
        
        for name in names:
            if name:  # Si el nombre no está vacío
                leader, created = Leader.objects.get_or_create(
                    name=name,
                    defaults={'active': True}
                )
                if created:
                    self.stdout.write(f"Nuevo líder creado: {name}")
                leaders.append(leader)
        
        return leaders

    def handle(self, *args, **options):
        if options['clean']:
            self.clean_database()

        file_path = options['file_path']

        try:
            df = pd.read_excel(
                file_path, 
                sheet_name="Seguimiento",
                header=1,
            )
            self.stdout.write(self.style.SUCCESS(f"Archivo leído exitosamente"))
            
            # Crear usuario por defecto para assigned_to y created_by
            default_user, _ = User.objects.get_or_create(
                username='admin',
                defaults={
                    'is_staff': True,
                    'is_superuser': True,
                    'email': 'admin@example.com'
                }
            )

            # Procesar cada fila
            for index, row in df.iterrows():
                try:
                    # Crear línea estratégica
                    strategic_line, _ = StrategicLine.objects.get_or_create(
                        name=str(row['Línea']).strip()
                    )

                    # Crear área
                    area = None
                    if pd.notna(row['AREA']):
                        area, _ = Area.objects.get_or_create(
                            name=str(row['AREA']).strip()
                        )

                    # Crear líderes
                    leaders = self.create_leader_from_text(row['Lidera'])
                    support_team = self.create_leader_from_text(row['Apoya'])

                    # Procesar fechas
                    due_date = pd.to_datetime(row['Fecha límite']).replace(tzinfo=pytz.UTC) if pd.notna(row['Fecha límite']) else None
                    alert_date = pd.to_datetime(row['Fecha alarma']).replace(tzinfo=pytz.UTC) if pd.notna(row['Fecha alarma']) else None

                    # Crear la tarea
                    task = Task.objects.create(
                        title=str(row['Meta']).strip(),
                        strategic_line=strategic_line,
                        status=str(row['Estado']).strip() if pd.notna(row['Estado']) else 'Pendiente',
                        year=int(row['Año']) if pd.notna(row['Año']) else datetime.now().year,
                        description=str(row['Observaciones']).strip() if pd.notna(row['Observaciones']) else '',
                        evidence=str(row['Evidencia']).strip() if pd.notna(row['Evidencia']) else '',
                        due_date=due_date,
                        alert_date=alert_date,
                        limit_month=int(row['Mes límite']) if pd.notna(row['Mes límite']) else None,
                        area=area,
                        daruma_code=str(row['CODIGO DARUMA o ID']).strip() if pd.notna(row['CODIGO DARUMA o ID']) else '',
                        deliverable=str(row['Entregable/Acción']).strip() if pd.notna(row['Entregable/Acción']) else '',
                        assigned_to=default_user,
                        created_by=default_user
                    )

                    # Asignar líderes y equipo de apoyo
                    if leaders:
                        task.leaders.set(leaders)
                    if support_team:
                        task.support_team.set(support_team)

                    self.stdout.write(self.style.SUCCESS(
                        f"Tarea creada exitosamente: {task.title} (fila {index + 2})"
                    ))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(
                        f"Error en fila {index + 2}: {str(e)}\n"
                        f"Datos: {row.to_dict()}"
                    ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error al procesar el archivo: {str(e)}"))