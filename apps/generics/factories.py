import datetime
import factory
from faker.providers import BaseProvider
from generics.utils import field_names
import inspect

from accounts.models import Profile
from business.models import Company, Project, Category, Employee, ProjectInfo


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

class ProfileFactory(GenericModelFactory):
    class Meta:
        model = Profile
        exclude = ('password',)
    is_active = True
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    username = factory.Sequence(lambda n: 'test_user_%d' % n)
    password = factory.Faker('word')
    email = factory.Sequence(lambda n: 'tester{0}@gmail.com'.format(n))
    photo = factory.django.ImageField(from_path='static/images/logo.jpg', file_name='the_file.png')

class CompanyFactory(GenericModelFactory):
    class Meta:
        model = Company
    stripe = factory.Sequence(lambda n: 'stripe-{0}23456'.format(n))
    logo = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png')
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))
    type = 'llc'
    filing_location = 'Austin'

class EmployeeFactory(GenericModelFactory):
    class Meta:
        model = Employee
    company = factory.SubFactory(CompanyFactory)
    profile = factory.SubFactory(ProfileFactory)
    primary = True

class ProjectFactory(GenericModelFactory):
    class Meta:
        model = Project
    class Params:
        aliases={'featured': 'boolean'}
    image = factory.django.ImageField(from_path='assets/images/logo.jpg', filename='the_file.png')
    type = 'technology'
    estimated_hours = 10
    project_manager = factory.SubFactory(ProfileFactory)
    company = factory.SubFactory(CompanyFactory)
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))
    start_date = datetime.datetime.today()

class ProjectInfoFactory(GenericModelFactory):
    class Meta:
        model = ProjectInfo
    project = factory.SubFactory(ProjectFactory)
