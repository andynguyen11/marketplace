# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-02 20:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0039_auto_20160801_1734'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectinfo',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
