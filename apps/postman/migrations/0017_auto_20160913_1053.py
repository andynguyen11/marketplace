# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-09-13 10:53
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('postman', '0016_auto_20160914_2021'),
    ]

    operations = [
        migrations.CreateModel(
            name='AttachmentInteraction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='visitor')),
                ('sent_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='sent at')),
                ('read_at', models.DateTimeField(blank=True, null=True, verbose_name='read at')),
                ('replied_at', models.DateTimeField(blank=True, null=True, verbose_name='replied at')),
                ('sender_bookmarked', models.BooleanField(default=False, verbose_name='bookmarked by sender')),
                ('recipient_bookmarked', models.BooleanField(default=False, verbose_name='bookmarked by recipient')),
                ('sender_archived', models.BooleanField(default=False, verbose_name='archived by sender')),
                ('recipient_archived', models.BooleanField(default=False, verbose_name='archived by recipient')),
                ('sender_deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='deleted by sender at')),
                ('recipient_deleted_at', models.DateTimeField(blank=True, null=True, verbose_name='deleted by recipient at')),
                ('moderation_status', models.CharField(choices=[('p', 'Pending'), ('a', 'Accepted'), ('r', 'Rejected')], default='a', max_length=1, verbose_name='status')),
                ('moderation_date', models.DateTimeField(blank=True, null=True, verbose_name='moderated at')),
                ('moderation_reason', models.CharField(blank=True, max_length=120, verbose_name='rejection reason')),
                ('moderation_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='moderated_attachmentinteractions', to=settings.AUTH_USER_MODEL, verbose_name='moderator')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='next_attachmentinteractions', to='postman.AttachmentInteraction', verbose_name='parent interaction')),
                ('recipient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='received_attachmentinteractions', to=settings.AUTH_USER_MODEL, verbose_name='recipient')),
                ('sender', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sent_attachmentinteractions', to=settings.AUTH_USER_MODEL, verbose_name='sender')),
                ('thread', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='child_attachmentinteractions', to='postman.AttachmentInteraction', verbose_name='root interaction')),
            ],
            options={
                'ordering': ['-sent_at'],
                'verbose_name': 'attachment interaction',
                'verbose_name_plural': 'attachment interactions',
            },
        ),
        migrations.AlterField(
            model_name='message',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='next_messages', to='postman.Message', verbose_name='parent interaction'),
        ),
        migrations.AlterField(
            model_name='message',
            name='thread',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='child_messages', to='postman.Message', verbose_name='root interaction'),
        ),
    ]
