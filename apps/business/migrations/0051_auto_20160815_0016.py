# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-15 00:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0050_auto_20160814_2035'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='status',
            field=models.CharField(default=b'new', max_length=30, null=True),
        ),
        migrations.AlterField(
            model_name='job',
            name='cash',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='job',
            name='equity',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
    ]
