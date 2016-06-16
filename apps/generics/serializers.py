from rest_framework import serializers
from .models import Attachment
from .base_serializers import RelationalModelSerializer, ParentModelSerializer

class AttachmentSerializer(RelationalModelSerializer):
    file = serializers.FileField(max_length=None, allow_empty_file=False, required=False)
    class Meta:
        model = Attachment
        fields = ('file',)

    def resolve_relations(self, obj):
        new_obj = {'file': obj.pop('file')}
        values = obj.values()
        assert len(values) == 1
        new_obj['content_object'] = values[0]
        return new_obj


