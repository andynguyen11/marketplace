# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-08 05:44
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('postman', '0003_auto_20160504_2013'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(blank=True, null=True, upload_to='uploads', verbose_name='Attachment')),
                ('message', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='message_attachment', to='postman.Message')),
            ],
        ),
        migrations.AddField(
            model_name='message',
            name='attachment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='file_attachment', to='postman.Attachment'),
        ),
    ]
