# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-07-10 20:44
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0034_profile_stripe_connect'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='payouts_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='verification',
            field=models.CharField(default=b'unverified', max_length=255),
        ),
    ]
