# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-04 21:06
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('business', '0042_auto_20160804_0935'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(default=b'pending', max_length=100)),
                ('job', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='business.Job')),
            ],
        ),
        migrations.CreateModel(
            name='Promo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=15)),
                ('expire_date', models.DateField()),
                ('dollars_off', models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True)),
                ('percent_off', models.IntegerField(blank=True, null=True)),
                ('single_use', models.BooleanField(default=False)),
                ('used', models.BooleanField(default=False)),
                ('customers', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='order',
            name='promo',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='payment.Promo'),
        ),
    ]
