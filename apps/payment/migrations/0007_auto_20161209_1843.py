# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-12-09 18:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0006_auto_20161209_1818'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productorder',
            name='request_status',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
