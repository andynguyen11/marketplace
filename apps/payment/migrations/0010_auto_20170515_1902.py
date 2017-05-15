# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-05-15 19:02
from __future__ import unicode_literals

from django.db import migrations, models

from payment.helpers import stripe_helpers

def add_payment_source(apps, schema_editor):
    ProductOrder = apps.get_model('payment', 'ProductOrder')
    for order in ProductOrder.objects.filter(status='paid'):
        try:
            charge = stripe_helpers.get_charge_info(order.stripe_charge_id)
            order.brand = charge.source.brand
            order.last4 = charge.source.last4
            order.save()
        except:
            pass


class Migration(migrations.Migration):

    dependencies = [
        ('payment', '0009_auto_20170328_1758'),
    ]

    operations = [
        migrations.AddField(
            model_name='productorder',
            name='brand',
            field=models.CharField(max_length=25, null=True),
        ),
        migrations.AddField(
            model_name='productorder',
            name='last4',
            field=models.CharField(max_length=10, null=True),
        ),
        migrations.RunPython(add_payment_source),
    ]
