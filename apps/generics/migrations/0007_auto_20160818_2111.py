# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-18 21:11
from __future__ import unicode_literals

from django.db import migrations, models
import generics.models


class Migration(migrations.Migration):

    dependencies = [
        ('generics', '0006_auto_20160802_2110'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attachment',
            name='file',
            field=models.FileField(max_length=255, upload_to=generics.models.upload_to),
        ),
    ]