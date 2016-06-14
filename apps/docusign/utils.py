from rest_framework import serializers

def to_nice_string(num):
    return {
        1: 'one',
        2: 'two',
        3: 'three',
    }[num]

def to_browsable_fieldset(singular, count=2):
    return [singular + 's'] + [
        singular + '_' + to_nice_string(i) for i in range(1, count+1)
    ]

def has_keys(d, keys):
    for k in keys:
        if d.get(k, None) == None: return False
    return True

def collapse_listview(validated_data, singular, count=2, validator=lambda x : x is not None, required_fields=[]):
    items = validated_data.pop(singular + 's', None) or [
        item for item in [
            validated_data.pop(singular + '_' + to_nice_string(i), None)
            for i in range(1, count + 1)
        ] if validator(item) and has_keys(item, required_fields)
    ]
    validated_data[singular + 's'] = items
    return validated_data


def pop_subset(fields, data):
    subset = {
        field: data.pop(field, [])
        for field in fields
    }
    return data, subset

def update_instance(instance, data):
    for k, v in data.items():
        if getattr(instance, k): 
            setattr(instance, k, v)
    instance.save()

class RelationalModelSerializer(serializers.ModelSerializer):

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

