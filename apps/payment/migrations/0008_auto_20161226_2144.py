# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-12-26 21:44
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0007_auto_20161209_1843'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='date_created',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='productorder',
            name='date_created',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
