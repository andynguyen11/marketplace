# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-10-12 17:36
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('business', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CompanyReview',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_date', models.DateTimeField(auto_now=True)),
                ('availability', models.DecimalField(decimal_places=1, max_digits=2)),
                ('timeliness', models.DecimalField(decimal_places=1, max_digits=2)),
                ('quality', models.DecimalField(decimal_places=1, max_digits=2)),
                ('skills', models.DecimalField(decimal_places=1, max_digits=2)),
                ('deadlines', models.DecimalField(decimal_places=1, max_digits=2)),
                ('communication', models.DecimalField(decimal_places=1, max_digits=2)),
                ('notes', models.TextField(blank=True, null=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='business.Company')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='DeveloperReview',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('create_date', models.DateTimeField(auto_now=True)),
                ('availability', models.DecimalField(decimal_places=1, max_digits=2)),
                ('timeliness', models.DecimalField(decimal_places=1, max_digits=2)),
                ('quality', models.DecimalField(decimal_places=1, max_digits=2)),
                ('skills', models.DecimalField(decimal_places=1, max_digits=2)),
                ('deadlines', models.DecimalField(decimal_places=1, max_digits=2)),
                ('communication', models.DecimalField(decimal_places=1, max_digits=2)),
                ('notes', models.TextField(blank=True, null=True)),
                ('contractor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
