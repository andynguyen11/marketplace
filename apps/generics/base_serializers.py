from rest_framework import serializers
from .utils import pop_subset, update_instance, field_names

def normalize_persistence(persisted):
    if(type(persisted) in (tuple, list)):
        return persisted[0]
    else:
        return persisted

class RelationalModelSerializer(serializers.ModelSerializer):
    """
    Generic approach to handling optional representations in a request.
    Define resolve_relations to handle internal resolution of the dict.

    `.create` and `.update` have straight-forward defaults

    Example: 
    ```
    class ItemSerializer(RelationalModelSerializer):
        relation = serializers.PrimaryKeyRelatedField(queryset=Relation.objects.all(), required=False)

        class Meta:
            model = Item
            fields = ('relation', 'relation_name', 'name')

        def resolve_relations(self, obj):
            if not obj.get('relation', None):
                obj['relation'] = Relation.objects.get(
                        name=obj.get('relation_name', None),
                        item_name=obj.get('name', None))
            return obj
    ```
    """
    def resolve_relations(self, obj):
        return obj

    def create_self(self, data, action='create'):
        data = self.resolve_relations(data)
        if action == 'update_or_create' and data.has_key('id'):
            id = data.pop('id')
            data = {'defaults': data, 'id': id }
        return normalize_persistence(getattr(self.Meta.model.objects, action)(**data))

    def create(self, validated_data, action='create'):
        return self.create_self( validated_data, action=action )

    def update(self, instance, validated_data):
        return update_instance(instance, self.resolve_relations(validated_data))


def smart_serialize(data, serializer, action='create'):
    if(isinstance(serializer, ParentModelSerializer)):
        return serializer.create(data, action=action)
    else:
        if(isinstance(serializer, RelationalModelSerializer)):
            return serializer.create_self(data, action)
        else:
            return normalize_persistence(getattr(serializer.Meta.model.objects, action)(**data))


def smart_serialize_set(data, serializer, action='create', representation=lambda s: s):
    if(type(data) in (tuple, list)):
        return map(representation, [smart_serialize(item, serializer, action) for item in data])
    else:
        return representation(smart_serialize(data, serializer, action))


class ParentModelSerializer(RelationalModelSerializer):
    """
    Generic approach to handling nested writable relationships.

    adding `sibling_fields` to the `Meta` object will:
        1 create the sibling(s) with the data provided the field
        2. replace it with the internal object before any other creations take place

    adding the `parent_key` and `child_fields` to the `Meta` object will cause the following:
        1. child fields will be popped from the pre-serialization dict
        2. the dict will be serialized
        3. each child set will be saved, with the serialized parent set to the parent_key

    example:

    class ParentSerializer(ParentModelSerializer):
        class Meta:
            parent_key = 'parent'
            child_fields = ('children','')
            sibling_fields = ('sibling','')
    """
    @property
    def child_fields(self):
        return getattr(self.Meta, 'child_fields', None)

    @property
    def parent_key(self):
        return getattr(self.Meta, 'parent_key', None)

    @property
    def sibling_fields(self):
        return getattr(self.Meta, 'sibling_fields', None)

    def to_internal_value(self, data):
        children = {}
        if type(data) == dict and self.child_fields: 
            # remove children from the validation process to avoid Uniqueness errors
            # this solution is not ideal, because the children aren't validated
            data, children = pop_subset(self.child_fields, data)
        data = super(RelationalModelSerializer, self).to_internal_value(data)
        data.update(children)
        return data

    def create_siblings_recursively(self, siblings, action='create'):
        return {
            field: smart_serialize_set(
                field_siblings,
                self.get_child_serializer(field),
                action)
            for field, field_siblings in siblings.items()
        }

    def create_siblings(self, data, action='create'):
        data, siblings = pop_subset(self.sibling_fields, data)
        data.update(self.create_siblings_recursively(siblings, action))
        return data

    def get_child_serializer(self, child):
        child_serializer = self.fields[child]
        if(hasattr(child_serializer, 'child')):
            child_serializer = child_serializer.child
        return child_serializer

    def create_children_recursively(self, parent, children, action='create'):
        for field in self.child_fields:
            child_serializer = self.get_child_serializer(field)
            for child in children.get(field, []):
                child[self.parent_key] = parent
                smart_serialize(child, child_serializer, action)

    def create_self_then_children(self, data, action='create'):
        data, children = pop_subset(self.child_fields, data)
        parent = self.create_self(data, action=action)
        self.create_children_recursively(parent, children, action)
        return parent

    def update_self_then_children(self, instance, data):
        data, children = pop_subset(self.child_fields, data)
        update_instance(instance, data)
        self.create_children_recursively(instance, children, action='update_or_create')
        return instance

    def create(self, data, action='create'):
        data = self.resolve_relations(data)

        if( self.sibling_fields ):
            data = self.create_siblings(data, action)

        if( self.child_fields ):
            return self.create_self_then_children(data, action)
        else:
            return self.create_self(data, action)

    def update(self, instance, data):
        data = self.resolve_relations(data)

        if( self.sibling_fields ):
            valdiated_data = self.create_siblings(data, action='update_or_create')

        if( self.child_fields ):
            return self.update_self_then_children( instance, data )
        else:
            return update_instance(instance, data)

