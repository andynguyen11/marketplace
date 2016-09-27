import os
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from generics.validators import file_validator


def upload_to(instance, filename):
    return instance.path

class Attachment(models.Model):
    file = models.FileField(upload_to=upload_to,  max_length=255, validators=[file_validator])
    upload_date = models.DateTimeField(auto_now=True)
    tag = models.CharField(max_length=255, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    deleted = models.BooleanField(default=False)
    content_object = GenericForeignKey('content_type', 'object_id')

    @property
    def basename(self):
        return os.path.basename(self.file.name)

    @property
    def original_name(self):
        return self.basename.split('-name-')[-1]

    def join(self, *args):
        return '-'.join(args)

    @property
    def tag_prefix(self):
        return self.join('tag', self.tag) if self.tag else ''

    @property
    def parent_prefix(self):
        return self.join(self.content_type.model, str(self.content_object.id))

    @property
    def name(self):
        return self.join(self.parent_prefix, self.tag_prefix, 'name', self.original_name)

    @property
    def path(self):
        return settings.MEDIA_ROOT + self.name

    @property
    def url(self):
        return settings.MEDIA_URL + self.file.name

    @property
    def data(self):
        return self.file.read()

    def __str__(self):
        return self.name


