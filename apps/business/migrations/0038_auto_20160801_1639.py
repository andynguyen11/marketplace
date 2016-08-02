# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-01 16:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0037_auto_20160801_1356'),
    ]

    operations = [
        migrations.RenameField(
            model_name='terms',
            old_name='bid',
            new_name='job',
        ),
        migrations.RemoveField(
            model_name='document',
            name='project',
        ),
        migrations.AlterField(
            model_name='job',
            name='end_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='job',
            name='start_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
