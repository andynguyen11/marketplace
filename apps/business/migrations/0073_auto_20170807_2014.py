# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-08-07 20:14
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0072_auto_20170802_2124'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='slug',
            field=models.SlugField(max_length=255),
        ),
    ]
