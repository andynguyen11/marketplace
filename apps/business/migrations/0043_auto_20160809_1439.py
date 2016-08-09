# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-09 14:39
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0042_auto_20160804_0935'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='company',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='business.Company'),
        ),
        migrations.AlterField(
            model_name='project',
            name='estimated_equity_percentage',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='estimated_equity_shares',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=9, null=True),
        ),
    ]
