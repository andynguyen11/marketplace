# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-06-16 14:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0002_auto_20160329_1230'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='companyreview',
            name='rating',
        ),
        migrations.RemoveField(
            model_name='developerreview',
            name='rating',
        ),
        migrations.AddField(
            model_name='companyreview',
            name='availability',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='companyreview',
            name='communication',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='companyreview',
            name='deadlines',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='companyreview',
            name='quality',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='companyreview',
            name='skills',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='companyreview',
            name='timeliness',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='developerreview',
            name='availability',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='developerreview',
            name='communication',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='developerreview',
            name='deadlines',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='developerreview',
            name='quality',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='developerreview',
            name='skills',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
        migrations.AddField(
            model_name='developerreview',
            name='timeliness',
            field=models.DecimalField(blank=True, decimal_places=1, max_digits=2, null=True),
        ),
    ]
