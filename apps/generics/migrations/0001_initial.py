# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-10-12 17:36
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import generics.models
import generics.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(max_length=255, upload_to=generics.models.upload_to, validators=[generics.validators.file_validator])),
                ('upload_date', models.DateTimeField(auto_now=True)),
                ('tag', models.CharField(max_length=255, null=True)),
                ('object_id', models.PositiveIntegerField()),
                ('deleted', models.BooleanField(default=False)),
                ('description', models.TextField(blank=True, null=True)),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
            ],
        ),
    ]
