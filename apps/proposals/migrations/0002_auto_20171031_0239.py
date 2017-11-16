# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-10-31 02:39
from __future__ import unicode_literals

from django.db import migrations, models


def approve_current_proposals(apps, schema_editor):
    Proposal = apps.get_model('proposals', 'Proposal')
    for proposal in Proposal.objects.all():
        proposal.approved = True
        proposal.redacted_cover_letter = proposal.cover_letter
        proposal.save()

class Migration(migrations.Migration):

    dependencies = [
        ('proposals', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='proposal',
            name='approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='proposal',
            name='redacted_cover_letter',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.RunPython(approve_current_proposals),
    ]