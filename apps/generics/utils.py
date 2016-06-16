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

