# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-07-14 18:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expertratings', '0004_auto_20160714_1541'),
    ]

    operations = [
        migrations.AlterField(
            model_name='skilltestuserfeedback',
            name='errors_found',
            field=models.CharField(choices=[(b'yes', b'YES'), (b'no', b'NO')], max_length=10),
        ),
    ]
