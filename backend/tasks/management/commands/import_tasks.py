# tasks/management/commands/import_tasks.py

import pandas as pd
from django.core.management.base import BaseCommand
from tasks.models import Task, StrategicLine
from django.contrib.auth import get_user_model
import pytz

User = get_user_model()

class Command(BaseCommand):
    help = 'Import tasks from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='The path to the Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        df = pd.read_excel(file_path, sheet_name="Seguimiento", header=1, usecols="B:N")

        self.stdout.write(self.style.SUCCESS(f"Columnas encontradas: {df.columns.tolist()}"))

        # Convertir 'Fecha límite' y 'Fecha alarma' a datetime
        df['Fecha límite'] = pd.to_datetime(df['Fecha límite'], errors='coerce', dayfirst=True)
        df['Fecha alarma'] = pd.to_datetime(df['Fecha alarma'], errors='coerce', dayfirst=True)
        df = df.dropna(subset=['Fecha límite'])

        for index, row in df.iterrows():
            self.stdout.write(f"Procesando fila {index + 1}")
            due_date = row['Fecha límite']
            
            if pd.isna(due_date):  
                self.stdout.write(self.style.WARNING(
                    f"Omitiendo la tarea '{row['Meta']}' por fecha límite inválida."
                ))
                continue

            due_date = due_date.to_pydatetime().replace(tzinfo=pytz.UTC)
            self.stdout.write(f"Fecha límite (procesada): {due_date}")

            strategic_line, _ = StrategicLine.objects.get_or_create(name=row['Línea'])

            leader_name = row['Lidera']
            leader = User.objects.filter(username=leader_name).first()
            if not leader:
                self.stdout.write(self.style.WARNING(
                    f"Omitiendo la tarea '{row['Meta']}' porque el usuario '{leader_name}' no existe."
                ))
                continue

            unique_fields = {
                'title': row['Meta'],
                'due_date': due_date,
                'assigned_to': leader,
                'status': row['Estado'],
                'strategic_line': strategic_line,
                'deliverable': row['Entregable/Acción'],
            }

            # Asigna `alert_date` como `None` si es `NaT`, de lo contrario, convierte a UTC
            alert_date = row['Fecha alarma'] if pd.notna(row['Fecha alarma']) else None
            if alert_date:
                alert_date = alert_date.to_pydatetime().replace(tzinfo=pytz.UTC)

            task_data = {
                'year': row['Año'],
                'priority': 'medium',
                'alert_date': alert_date,  # Asignamos `None` si `Fecha alarma` está vacío
                'limit_month': row.get('Mes límite'),
                'area': row.get('AREA', ''),
                'support_team': row.get('Apoya', ''),
                'evidence': row.get('Evidencia', ''),
                'created_by': leader
            }

            try:
                task, created = Task.objects.update_or_create(
                    **unique_fields, defaults=task_data
                )
                action = "Creada" if created else "Actualizada"
                self.stdout.write(self.style.SUCCESS(f"{action}: {task.title}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error al crear/actualizar la tarea: {e}"))
                self.stdout.write(f"Valores de fila problemáticos: {row.to_dict()}")
