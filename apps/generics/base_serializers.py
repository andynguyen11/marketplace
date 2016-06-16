from rest_framework import serializers
from .utils import pop_subset, update_instance

class RelationalModelSerializer(serializers.ModelSerializer):
    """
    Generic approach to handling optional representations in a request.
    Define resolve_relations to handle internal resolution of the dict.

    Example: 
    class ItemSerializer(RelationModelSerializer):
        relation = serializers.PrimaryKeyRelatedField(queryset=Relation.objects.all(), required=False)

        class Meta:
            model = Item
            fields = ('relation', 'relation_name', 'name')

        def resolve_relations(self, obj):
            if not obj.get('relation', None):
                obj['relation'] = Relation.objects.get(
                        name=obj.get('relation_name', None),
                        item_name=obj.get('name', None))
    """

    def resolve_relations(self, obj):
        return obj

    def create_self(self, data, action='create'):
        data = self.resolve_relations(data)
        persisted = getattr(self.Meta.model.objects, action)(**data)
        if(type(persisted) in (tuple, list)):
            return persisted[0]
        else:
            return persisted


class ParentModelSerializer(RelationalModelSerializer):
    """
    Generic approach to handling nested writable relationships.
    adding the parent_key and child_fields to the Meta object will cause the following:
        1. child fields will be popped from the pre-serialization dict
        2. the dict will be serialized
        3. each child set will be saved, with the serialized parent set to the parent_key

    example:

    class ParentSerializer(ParentModelSerializer):
        class Meta:
            parent_key = 'parent'
            child_fields = ('children','')
    """

    def get_child_serializer(self, child):
        child_serializer = self.fields[child]
        if(hasattr(child_serializer, 'child')):

            child_serializer = child_serializer.child
        return child_serializer

    def create_child(self, child, child_serializer, action='create'):
        if(isinstance(child_serializer, ParentModelSerializer)):
            child_serializer.create(child, action=action)
        else:
            if(isinstance(child_serializer, RelationalModelSerializer)):
                child_serializer.create_self(child, action)
            else:
                getattr(child_serializer.Meta.model.objects, action)(**child)

    def create_children_recursively(self, parent_key, parent,
            child_fields, children, action='create'):
        for field in child_fields:
            child_serializer = self.get_child_serializer(field)
            for child in children.get(field, []):
                child[parent_key] = parent
                self.create_child(child, child_serializer, action)

    def create_self_then_children(self,
            parent_key, child_fields, data, action='create'):
        data, children = pop_subset(child_fields, data)
        parent = self.create_self(data, action=action)
        self.create_children_recursively(parent_key, parent,
                child_fields, children, action)
        return parent

    def update_self_then_children(self, parent_key, child_fields, instance, data):
        data, children = pop_subset(child_fields, data)
        update_instance(instance, data)
        self.create_children_recursively(parent_key, instance,
                child_fields, children, action='update_or_create')
        return instance

    def create(self, validated_data, action='create'):
        return self.create_self_then_children(
                self.Meta.parent_key,
                self.Meta.child_fields,
                validated_data,
                action=action)

    def update(self, instance, validated_data):
        return self.update_self_then_children(
                self.Meta.parent_key,
                self.Meta.child_fields,
                instance, validated_data)

