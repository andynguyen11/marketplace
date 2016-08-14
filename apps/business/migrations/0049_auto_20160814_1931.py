# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-14 19:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0048_auto_20160814_0628'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='mix',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='project',
            name='slug',
            field=models.SlugField(default='a'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='job',
            name='status',
            field=models.CharField(blank=True, choices=[('pending', 'Pending'), ('active', 'Active'), ('completed', 'Completed')], default=b'pending', max_length=100, null=True),
        ),
    ]
