# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-16 20:24
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('docusign', '0010_auto_20160613_2054'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='documentattachment',
            name='document',
        ),
        migrations.DeleteModel(
            name='DocumentAttachment',
        ),
    ]
