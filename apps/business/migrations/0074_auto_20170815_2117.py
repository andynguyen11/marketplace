# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-08-15 21:17
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0073_auto_20170807_2014'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Category',
        ),
        migrations.RenameField(
            model_name='project',
            old_name='years_experience',
            new_name='years',
        ),
        migrations.RemoveField(
            model_name='company',
            name='category',
        ),
        migrations.RemoveField(
            model_name='project',
            name='location',
        ),
        migrations.RemoveField(
            model_name='project',
            name='category',
        ),
        migrations.AddField(
            model_name='project',
            name='category',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
