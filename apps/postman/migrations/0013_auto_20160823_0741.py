# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-23 07:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('postman', '0012_auto_20160801_1734'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='message',
            options={'ordering': ['sent_at', 'id'], 'verbose_name': 'message', 'verbose_name_plural': 'messages'},
        ),
        migrations.AlterField(
            model_name='message',
            name='moderation_status',
            field=models.CharField(choices=[('p', 'Pending'), ('a', 'Accepted'), ('r', 'Rejected')], default='a', max_length=1, verbose_name='status'),
        ),
    ]