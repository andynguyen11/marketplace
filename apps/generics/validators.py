# import magic

from django.conf import settings
from django.template.defaultfilters import filesizeformat
from django.core.exceptions import ValidationError


def file_validator(value):
    error_messages = {
        'max_size': u'Ensure this file size is not greater than %(max_size)s. Your file size is %(size)s.',
        'content_type': u'Files of type %(content_type)s are not supported.',
    }

    max_size = settings.MAX_FILE_SIZE
    content_types = settings.FILE_CONTENT_TYPES

    for file in value:
        if file.size > max_size:
            params = {
                'max_size': filesizeformat(max_size),
                'size': filesizeformat(value.size),
            }
            raise ValidationError(error_messages['max_size'], 'max_size', params)

        content_type = magic.from_buffer(file.read(), mime=True)
        print(content_type)
        if content_type not in content_types:
            params = {'content_type': content_type}
            raise ValidationError(error_messages['content_type'], 'content_type', params)