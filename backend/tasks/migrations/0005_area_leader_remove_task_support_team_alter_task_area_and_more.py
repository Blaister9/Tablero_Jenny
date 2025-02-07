# Generated by Django 5.1.2 on 2024-11-15 17:17

import django.db.models.deletion
from django.db import migrations, models


def create_initial_areas(apps, schema_editor):
    Area = apps.get_model('tasks', 'Area')
    Area.objects.create(id=1, name='OASTI')
    Area.objects.create(id=2, name='DGI')

def migrate_areas(apps, schema_editor):
    Area = apps.get_model('tasks', 'Area')
    Task = apps.get_model('tasks', 'Task')
    
    # Crear áreas
    oasti = Area.objects.create(id=1, name='OASTI')
    dgi = Area.objects.create(id=2, name='DGI')
    
    # Limpiar el campo area_id actual
    Task.objects.all().update(area=None)

def migrate_area_data(apps, schema_editor):
    Task = apps.get_model('tasks', 'Task')
    Area = apps.get_model('tasks', 'Area')

    for task in Task.objects.all():
        area_name = task.area_old
        if area_name:
            area_name = area_name.strip()
            area_obj, created = Area.objects.get_or_create(name=area_name)
            task.area = area_obj
            task.save()

class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0004_alter_task_status_alter_task_title_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='task',
            old_name='area',
            new_name='area_old',
        ),
        migrations.CreateModel(
            name='Area',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
            ],
            options={
                'verbose_name': 'Área',
                'verbose_name_plural': 'Áreas',
            },
        ),
        # Ejecutar la función que crea las áreas
        migrations.RunPython(create_initial_areas),
        migrations.CreateModel(
            name='Leader',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('role', models.CharField(blank=True, max_length=100, verbose_name='Rol')),
                ('active', models.BooleanField(default=True, verbose_name='Activo')),
            ],
            options={
                'verbose_name': 'Líder',
                'verbose_name_plural': 'Líderes',
                'ordering': ['name'],
            },
        ),
        migrations.RemoveField(
            model_name='task',
            name='support_team',
        ),
        # Añadir el nuevo campo 'area' como ForeignKey
        migrations.AddField(
            model_name='task',
            name='area',
            field=models.ForeignKey(null=True, blank=True, on_delete=django.db.models.deletion.PROTECT, to='tasks.Area', verbose_name='Área'),
        ),
        # Migrar los datos del campo 'area_old' al nuevo campo 'area'
        migrations.RunPython(migrate_area_data),
        # Eliminar el campo 'area_old'
        migrations.RemoveField(
            model_name='task',
            name='area_old',
        ),
        migrations.AddField(
            model_name='task',
            name='leaders',
            field=models.ManyToManyField(related_name='tasks_as_leader', to='tasks.leader', verbose_name='Líderes'),
        ),
        migrations.AddField(
            model_name='task',
            name='support_team',
            field=models.ManyToManyField(blank=True, related_name='tasks_as_support', to='tasks.leader', verbose_name='Equipo de Apoyo'),
        ),
    ]
