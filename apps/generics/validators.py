import magic

from django.conf import settings
from django.template.defaultfilters import filesizeformat
from django.core.exceptions import ValidationError
from rest_framework import serializers

def file_validator(file):
    error_messages = {
        'max_size': u'Ensure this file size is not greater than {0}. Your file size is {1}.',
        'content_type': u'Files of type {0} are not supported. If you need to send this file, please zip it.',
    }

    max_size = settings.MAX_FILE_SIZE
    content_types = settings.FILE_CONTENT_TYPES

    if file.size > max_size:
        return error_messages['max_size'].format(filesizeformat(max_size), filesizeformat(file.size))

    content_type = magic.from_buffer(file.read(), mime=True)
    if content_type not in content_types:
        return error_messages['content_type'].format(content_type)

    return None

def image_validator(file):
    err = file_validator(file)
    if err:
        raise serializers.ValidationError(err)
