# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-10-14 05:18
from __future__ import unicode_literals

import business.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0059_auto_20161005_1919'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='project_image',
            field=models.ImageField(blank=True, null=True, upload_to=business.models.path_and_rename),
        ),
    ]