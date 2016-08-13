from rest_framework import serializers
from .models import Attachment
from .base_serializers import RelationalModelSerializer, ParentModelSerializer

class AttachmentSerializer(RelationalModelSerializer):
    file = serializers.FileField(max_length=None, allow_empty_file=False, required=False)
    url = serializers.CharField(read_only=True)
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Attachment
        fields = ('id', 'file', 'tag', 'url')

    def resolve_relations(self, obj):
        id, url = obj.pop('id', None), obj.pop('url', None)
        new_obj = {'file': obj.pop('file') }

        tag = obj.pop('tag', None)
        if tag:
            new_obj['tag'] = tag

        values = obj.values()
        assert len(values) == 1
        new_obj['content_object'] = values[0]
        if id: new_obj['id'] = id
        return new_obj


