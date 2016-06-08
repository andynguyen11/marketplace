# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-07 01:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0014_auto_20160606_2315'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='type',
            field=models.CharField(choices=[('Non-Disclosure', 'Non-Disclosure Agreement'), ('Contract Service', 'Contract Service Agreement'), ('Non-Compete', 'Non-Compete Agreement')], default='Non-Disclosure', max_length=100),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='document',
            name='status',
            field=models.CharField(choices=[('sent', 'Sent'), ('received', 'Received'), ('signed', 'Signed')], default=b'Sent', max_length=100),
        ),
    ]