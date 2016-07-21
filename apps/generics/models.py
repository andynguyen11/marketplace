import os
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from generics.validators import file_validator


def upload_to(instance, filename):
    return instance.path


class Attachment(models.Model):
    file = models.FileField(upload_to=upload_to, validators=[file_validator, ])
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    @property
    def basename(self):
        return os.path.basename(self.file.name)

    @property
    def original_name(self):
        return self.basename.split('-name-')[-1]

    @property
    def name(self):
        return '-'.join([self.content_type.model, str(self.content_object.id), 'name', self.original_name])

    @property
    def path(self):
        return settings.MEDIA_ROOT + self.name

    @property
    def data(self):
        return self.file.read()

    def __str__(self):
        return '%s' % self.name

