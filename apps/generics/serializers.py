from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from generics.models import Attachment
from generics.base_serializers import RelationalModelSerializer, ParentModelSerializer
from generics.validators import file_validator

def retrieve_content_object(source, known_keys=['id', 'file', 'tag', 'description', ]):
    additional = { k: v for k, v in source.items() if k not in known_keys }
    if len(additional.keys()) == 1:
        model_name = additional.keys()[0]
        content_type = ContentType.objects.get(model=model_name)
        return {'content_object': content_type.get_object_for_this_type(pk=additional[model_name])}
    return {}

class AttachmentSerializer(RelationalModelSerializer):
    file = serializers.FileField(max_length=None, allow_empty_file=False, required=False, write_only=True, validators=[file_validator])
    original_name = serializers.CharField(read_only=True)
    url = serializers.CharField(read_only=True)
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Attachment
        fields = ('id', 'file', 'tag', 'url', 'original_name', 'description', )

    def retrieve_content_object(self, obj):
        obj.update(retrieve_content_object(self.initial_data.dict()))
        return obj

   #def list(self, request):
   #    return [super(AttachmentSerializer, self).list(request)

    def resolve_relations(self, obj):
        obj = self.retrieve_content_object(obj)
        new_obj = { k: obj.pop(k) for k in ['id', 'file', 'tag', 'description', ] if obj.has_key(k) }
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


