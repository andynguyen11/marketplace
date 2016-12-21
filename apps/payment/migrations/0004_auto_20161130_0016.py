# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-11-30 00:16
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('payment', '0003_order_date_charged'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductOrder',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now=True)),
                ('date_charged', models.DateTimeField(blank=True, null=True)),
                ('_product', models.CharField(max_length=20)),
                ('related_object_id', models.PositiveIntegerField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('fee', models.DecimalField(decimal_places=2, max_digits=10, null=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('cancelled', 'Cancelled'), ('failed', 'Failed')], default=b'pending', max_length=20)),
                ('stripe_charge_id', models.CharField(max_length=50, null=True)),
                ('details', models.CharField(max_length=250, null=True)),
                ('result', models.CharField(max_length=100, null=True)),
                ('payer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payer', to=settings.AUTH_USER_MODEL)),
                ('promo', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='payment.Promo')),
                ('recipient', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='recipient', to=settings.AUTH_USER_MODEL)),
                ('related_model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.ContentType')),
            ],
        ),
        migrations.AddField(
            model_name='order',
            name='_product',
            field=models.CharField(choices=[(b'start_job', b'Start Job'), (b'connect_job', b'Connect Contractor and Contractee for a bid/project'), (b'test_log', b'Test Logging')], default='start_job', max_length=20),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('cancelled', 'Cancelled'), ('failed', 'Failed')], default=b'pending', max_length=20),
        ),
    ]
