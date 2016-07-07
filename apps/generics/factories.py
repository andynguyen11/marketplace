import factory
from faker.providers import BaseProvider
from generics.utils import field_names
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

def factory_parameters(factory_class):
    return factory_class._meta.parameters

def model_fields(factory_class):
    return field_names(factory_model(factory_class))

def all_factory_fields(factory_class):
    factory_fields = factory_class._meta.declarations.keys()
    return set(model_fields(factory_class) + tuple(factory_fields))

def add_generic_fields(model, attrs):
    unaccounted_for = []
    for field in field_names(model):
        if not(attrs.has_key(field)):
            generator = default_factory(field)
            if generator:
                attrs[field] = factory.Faker(generator)
            else: unaccounted_for.append(field)
    if(False):
        print "%s factory doesn't generate %s" % (model, ', '.join(unaccounted_for))
    return attrs

class GenericModelFactory(factory.django.DjangoModelFactory):

    class Params:
        aliases = {}

    @classmethod
    def _apply_aliases(cls, kwargs):
        aliases = dict(factory_parameters(cls).get('aliases', {}))
        aliases.update(kwargs)
        return aliases

    @classmethod
    def _apply_generics(cls, kwargs):
        kwargs = cls._apply_aliases(kwargs)
        kwargs = add_generic_fields(factory_model(cls), cls.declarations())
        return kwargs

    @classmethod
    def build(cls, **kwargs):
        kwargs = cls._apply_generics(kwargs)
        attrs = cls.attributes(create=False, extra=kwargs)
        return cls._generate(False, attrs)

    @classmethod
    def create(cls, **kwargs):
        kwargs = cls._apply_generics(kwargs)
        attrs = cls.attributes(create=True, extra=kwargs)
        return cls._generate(True, attrs)

