# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-04-10 16:20
from __future__ import unicode_literals

from django.db import migrations, models

def set_cash_equity_values(apps, schema_editor):
    Proposal = apps.get_model('proposals', 'Proposal')
    for proposal in Proposal.objects.all():
        proposal.equity_flag = True if proposal.equity else False
        proposal.cash_flag = True if proposal.cash else False
        proposal.save()


class Migration(migrations.Migration):

    dependencies = [
        ('proposals', '0005_auto_20170308_0706'),
    ]

    operations = [
        migrations.RunSQL('SET CONSTRAINTS ALL IMMEDIATE', reverse_sql=migrations.RunSQL.noop),
        migrations.AddField(
            model_name='proposal',
            name='cash_flag',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='proposal',
            name='equity_flag',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(set_cash_equity_values),
        migrations.RemoveField(
            model_name='proposal',
            name='cash',
        ),
        migrations.RemoveField(
            model_name='proposal',
            name='equity',
        ),
        migrations.RenameField(
            model_name='proposal',
            old_name='cash_flag',
            new_name='cash',
        ),
        migrations.RenameField(
            model_name='proposal',
            old_name='equity_flag',
            new_name='equity',
        ),
        migrations.AlterModelOptions(
            name='proposal',
            options={'ordering': ('-create_date',)},
        ),
        migrations.RunSQL(migrations.RunSQL.noop, reverse_sql='SET CONSTRAINTS ALL IMMEDIATE'),
    ]
