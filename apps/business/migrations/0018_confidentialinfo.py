# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-16 22:18
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0017_auto_20160607_0308'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfidentialInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('summary', models.CharField(max_length=100)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='business.Project')),
            ],
        ),
    ]
