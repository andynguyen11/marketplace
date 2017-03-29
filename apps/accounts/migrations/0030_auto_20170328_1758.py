# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-03-28 17:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0029_auto_20170228_2229'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='role',
            field=models.CharField(blank=True, choices=[(b'full-stack', b'Fullstack Developer'), (b'front-end', b'Frontend Developer'), (b'back-end', b'Backend Developer'), (b'mobile', b'Mobile Developer'), (b'entrepreneur', b'Entrepreneur')], max_length=100, null=True),
        ),
    ]
