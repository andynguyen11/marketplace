# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-02 23:34
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0004_auto_20160616_2242'),
    ]

    operations = [
        migrations.RenameField(
            model_name='developerreview',
            old_name='developer',
            new_name='contractor',
        ),
    ]