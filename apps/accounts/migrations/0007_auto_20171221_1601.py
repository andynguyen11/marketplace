# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-12-21 16:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_cleanup_notifications'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='contract_to_hire',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='freelance',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='full_time',
            field=models.BooleanField(default=True),
        ),
    ]
