# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-05-05 14:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_auto_20160505_0851'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='biography',
            field=models.TextField(blank=True, null=True),
        ),
    ]