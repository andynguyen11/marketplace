# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-07-14 11:52
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_auto_20160713_0309'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to=b'profile'),
        ),
    ]