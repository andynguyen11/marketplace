# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('postman', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='recipient_bookmarked',
            field=models.BooleanField(default=False, verbose_name='bookmarked by recipient'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='message',
            name='sender_bookmarked',
            field=models.BooleanField(default=False, verbose_name='bookmarked by sender'),
            preserve_default=True,
        ),
    ]
