# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-07-24 01:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0014_auto_20160714_1952'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to=b'profile-photos'),
        ),
    ]