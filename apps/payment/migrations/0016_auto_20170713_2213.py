# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-07-13 22:13
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0015_auto_20170706_1555'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoiceitem',
            name='description',
            field=models.CharField(blank=True, max_length=255, null=True),
        )
    ]
