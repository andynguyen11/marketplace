# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-08-14 06:28
from __future__ import unicode_literals

import datetime
from django.db import migrations, models
from django.utils.timezone import utc
import tagulous.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0047_auto_20160810_1915'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='date_created',
            field=models.DateTimeField(auto_now=True, default=datetime.datetime(2016, 8, 14, 6, 28, 15, 129758, tzinfo=utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='job',
            name='cash',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='job',
            name='equity',
            field=models.DecimalField(blank=True, decimal_places=2, default=0, max_digits=5, null=True),
        ),
        migrations.AlterField(
            model_name='project',
            name='category',
            field=tagulous.models.fields.TagField(_set_tag_meta=True, autocomplete_view=b'skills_autocomplete', blank=True, help_text='Enter a comma-separated tag string', initial='Angular.js, JQuery, Python, nginx, uwsgi', null=True, to='business.Category'),
        ),
        migrations.AlterField(
            model_name='project',
            name='skills',
            field=tagulous.models.fields.TagField(_set_tag_meta=True, autocomplete_view=b'skills_autocomplete', blank=True, help_text='Enter a comma-separated tag string', initial='Angular.js, JQuery, Python, nginx, uwsgi', null=True, to='accounts.Skills'),
        ),
    ]
