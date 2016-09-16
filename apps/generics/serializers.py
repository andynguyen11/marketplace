from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Attachment
from .base_serializers import RelationalModelSerializer, ParentModelSerializer
from generics.validators import file_validator


class AttachmentSerializer(RelationalModelSerializer):
    file = serializers.FileField(max_length=None, allow_empty_file=False, required=False, write_only=True, validators=[file_validator])
    url = serializers.CharField(read_only=True)
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Attachment
        fields = ('id', 'file', 'tag', 'url')

    def resolve_relations(self, obj):
        new_obj = { k: obj.pop(k) for k in ['id', 'file', 'tag'] if obj.has_key(k) }
        values = [v for k, v in obj.items() if k not in self.Meta.fields]
        if self.instance and self.instance.id is not None:
            if len(values) == 1:
                new_obj['content_object'] = values[0]
        else:
            assert len(values) == 1
            new_obj['content_object'] = values[0]
        return new_obj

    def create_self(self, data, action='create'):
        data = self.resolve_relations(data)
        if action == 'update_or_create' and data.has_key('tag'):
            tag = data.pop('tag')
            content_object = data.pop('content_object')
            content_type = ContentType.objects.get_for_model(content_object)
            data = {'defaults': data, 'tag': tag, 'content_type': content_type, 'object_id': content_object.id }
        return super(AttachmentSerializer, self).create_self(data, action, normalize=False)


