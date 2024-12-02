# Generated by Django 5.1.2 on 2024-12-02 14:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maintenance', '0003_alter_maintenanceschedule_month'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='maintenanceitem',
            name='oasti_responsible',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='maintained_items', to='users.user', verbose_name='Responsable OASTI'),
        ),
        migrations.AlterField(
            model_name='maintenanceschedule',
            name='updated_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='schedule_updates', to='users.user', verbose_name='Actualizado por'),
        ),
    ]