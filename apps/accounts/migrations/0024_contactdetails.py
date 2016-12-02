# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-12-01 22:50
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0023_profile_long_description'),
    ]

    operations = [
        migrations.CreateModel(
            name='ContactDetails',
            fields=[
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('email', models.CharField(max_length=50)),
                ('phone', models.CharField(max_length=50)),
                ('website', models.CharField(blank=True, max_length=50, null=True)),
                ('skype', models.CharField(blank=True, max_length=50, null=True)),
                ('linkedin', models.CharField(blank=True, max_length=50, null=True)),
                ('angellist', models.CharField(blank=True, max_length=50, null=True)),
                ('github', models.CharField(blank=True, max_length=50, null=True)),
                ('instagram', models.CharField(blank=True, max_length=50, null=True)),
                ('twitter', models.CharField(blank=True, max_length=50, null=True)),
                ('facebook', models.CharField(blank=True, max_length=50, null=True)),
            ],
        ),
    ]
