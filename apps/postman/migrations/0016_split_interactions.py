# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-09-13 11:16
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

fields = ('email', 'sent_at', 'read_at', 'replied_at', 'sender_bookmarked', 'recipient_bookmarked',
          'sender_archived', 'recipient_archived', 'sender_deleted_at', 'recipient_deleted_at',
          'moderation_status', 'moderation_date', 'moderation_reason', 'moderation_by', 'parent_id', 'recipient_id', 'sender_id', 'thread_id')

def to_dict(message):
    return { k: getattr(message, k) for k in fields }

def split_interactions(apps, schema_editor):
    Message = apps.get_model("postman", "message")
    AttachmentInteraction = apps.get_model("postman", "attachmentinteraction")
    Interaction = apps.get_model("postman", "interaction")

    for message in Message.objects.all():
        interaction = Interaction.objects.create(**to_dict(message))
        message.interaction_ptr = interaction
        message.save()

    for message in AttachmentInteraction.objects.all():
        interaction = Interaction.objects.create(**to_dict(message))
        message.interaction_ptr = interaction
        message.save()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('postman', '0015_auto_20160913_1053'),
    ]

    operations = [
        migrations.RunSQL("ALTER TABLE postman_attachmentinteraction DROP CONSTRAINT postman_attachmentinteraction_pkey cascade;"),
        migrations.RunSQL("ALTER TABLE postman_message DROP CONSTRAINT postman_message_pkey cascade;"),

        migrations.CreateModel(
            name='Interaction',
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
                ('moderation_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='moderated_interactions', to=settings.AUTH_USER_MODEL, verbose_name='moderator')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='next_interaction', to='postman.Interaction', verbose_name='parent interaction')),
                ('recipient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='received_interaction', to=settings.AUTH_USER_MODEL, verbose_name='recipient')),
                ('sender', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sent_interaction', to=settings.AUTH_USER_MODEL, verbose_name='sender')),
                ('thread', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='child_interaction', to='postman.Interaction', verbose_name='root interaction')),
            ],
        ),

        migrations.AddField(
            model_name='attachmentinteraction',
            name='interaction_ptr',
            field=models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, null=True, serialize=False, to='postman.Interaction'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='message',
            name='interaction_ptr',
            field=models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, null=True, serialize=False, to='postman.Interaction'),
            preserve_default=False,
        ),


        migrations.RunPython(split_interactions),


        migrations.AlterField(
            model_name='attachmentinteraction',
            name='interaction_ptr',
            field=models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, serialize=False, to='postman.Interaction', null=False, primary_key=True, ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='message',
            name='interaction_ptr',
            field=models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, serialize=False, to='postman.Interaction', null=False, primary_key=True, ),
            preserve_default=False,
        ),



        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='email',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='id',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='moderation_by',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='moderation_date',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='moderation_reason',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='moderation_status',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='read_at',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='recipient',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='recipient_archived',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='recipient_bookmarked',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='recipient_deleted_at',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='replied_at',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='sender',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='sender_archived',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='sender_bookmarked',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='sender_deleted_at',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='sent_at',
        ),
        migrations.RemoveField(
            model_name='attachmentinteraction',
            name='thread',
        ),
        migrations.RemoveField(
            model_name='message',
            name='email',
        ),
        migrations.RemoveField(
            model_name='message',
            name='id',
        ),
        migrations.RemoveField(
            model_name='message',
            name='moderation_by',
        ),
        migrations.RemoveField(
            model_name='message',
            name='moderation_date',
        ),
        migrations.RemoveField(
            model_name='message',
            name='moderation_reason',
        ),
        migrations.RemoveField(
            model_name='message',
            name='moderation_status',
        ),
        migrations.RemoveField(
            model_name='message',
            name='parent',
        ),
        migrations.RemoveField(
            model_name='message',
            name='read_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='recipient',
        ),
        migrations.RemoveField(
            model_name='message',
            name='recipient_archived',
        ),
        migrations.RemoveField(
            model_name='message',
            name='recipient_bookmarked',
        ),
        migrations.RemoveField(
            model_name='message',
            name='recipient_deleted_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='replied_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='sender',
        ),
        migrations.RemoveField(
            model_name='message',
            name='sender_archived',
        ),
        migrations.RemoveField(
            model_name='message',
            name='sender_bookmarked',
        ),
        migrations.RemoveField(
            model_name='message',
            name='sender_deleted_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='sent_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='thread',
        ),
    ]
