# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-29 12:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0002_auto_20160329_1228'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='featured_tagline',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
