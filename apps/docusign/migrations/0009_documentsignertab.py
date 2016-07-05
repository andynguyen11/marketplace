# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-10 19:58
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('docusign', '0008_auto_20160609_2253'),
    ]

    operations = [
        migrations.CreateModel(
            name='DocumentSignerTab',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(max_length=100)),
                ('document_signer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='docusign.DocumentSigner')),
                ('template_role_tab', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='docusign.TemplateRoleTab')),
            ],
        ),
    ]