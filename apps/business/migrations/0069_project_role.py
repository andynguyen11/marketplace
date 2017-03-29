# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-02-28 22:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0068_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='role',
            field=models.CharField(blank=True, choices=[(b'full-stack', b'Fullstack Developer'), (b'front-end', b'Frontend Developer'), (b'back-end', b'Backend Developer'), (b'mobile', b'Mobile Developer')], max_length=100, null=True),
        ),
    ]