# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-06 23:19
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DocumentTemplate',
            fields=[
                ('template_id', models.CharField(max_length=100, primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='DocumentTemplateRole',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role_name', models.CharField(max_length=10)),
                ('order', models.IntegerField()),
                ('template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='docusign.DocumentTemplate')),
            ],
        ),
    ]
