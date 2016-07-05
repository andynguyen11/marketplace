import factory
from faker.providers import BaseProvider
from .utils import field_names
import inspect

def subclasses_provider(subclass):
    return (inspect.isclass(subclass)
            and issubclass(subclass, BaseProvider))

def is_provider(value):
    return subclasses_provider(value) or (
            inspect.ismethod(value) and (
                subclasses_provider(value.im_self) or
                subclasses_provider(value.im_class)))

def get_base_providers(instance):
    ''' Inspect the faker instance to find all provider keys.
        We want this so we can have an alias map,
        so summary will automatically map to text '''
    return { k: k for k, v in instance.__dict__.items() if is_provider(v) }

aliases = {
    'summary': 'text',
    'title': 'sentence',
    'description': 'text',
    'short_blurb': 'text',
    'blurb': 'text',
    'phone': 'phone_number',
    'address2': 'address',
    'username': 'user_name',
}

aliases.update(get_base_providers(factory.Faker._get_faker()))

def default_factory(field_name):
    return aliases.get(field_name, None)

def factory_model(factory_class):
    return factory_class._meta.model

def factory_model_fields(factory_class):
    return field_names(factory_model(factory_class))

def buildGenericModelFactory(model, types={},
        exclude=tuple(),
        debug=False, **attrs):
    """
    types is a list of aliases for Faker factories, and attrs are custom factories
    """
    unaccounted_for = []
    for field in field_names(model):
        if not(attrs.has_key(field)):
            generator = default_factory(field) or types.get(field, None)
            if generator:
                attrs[field] = factory.Faker(generator)
            else: unaccounted_for.append(field)
    if(debug):
        print "%s factory doesn't generate %s" % (model, ', '.join(unaccounted_for))

    model_factory = factory.make_factory(model,
        FACTORY_CLASS=factory.django.DjangoModelFactory,
        **attrs
    )
    model_factory._meta.exclude = exclude
    return model_factory
