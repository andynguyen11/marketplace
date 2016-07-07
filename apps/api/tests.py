import datetime
from rest_assured.testcases import BaseRESTAPITestCase
import factory
from django.db import models

from generics.factories import GenericModelFactory
from generics.testcases import CreateManyMixin, CRUDMixin
from accounts.models import Profile
from business.models import Company, Project, ConfidentialInfo, Category

class ProfileFactory(GenericModelFactory):
    class Meta:
        model = Profile
        exclude = ('password',)
    is_active = True

class CompanyFactory(GenericModelFactory):
    class Meta:
        model = Company

    stripe = factory.Sequence(lambda n: 'stripe-{0}23456'.format(n))
    logo = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png')
    primary_contact = factory.SubFactory(ProfileFactory)
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))


class CompanyListAPITestCase(CreateManyMixin, BaseRESTAPITestCase):

    base_name = 'api:company'
    LIST_SUFFIX = ''

    factory_class = CompanyFactory
    user_factory = ProfileFactory

    def get_create_data(self):
        data = super(CreateManyMixin, self).get_create_data()
        data['category'] = data['category'].get_tag_string()
        return data


class ProjectFactory(GenericModelFactory):
    class Meta:
        model = Project

    class Params:
        aliases={'featured': 'boolean'}

    image = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png')
    type = 'technology'
    estimated_hours = 10
    project_manager = factory.SubFactory(ProfileFactory)
    company = factory.SubFactory(CompanyFactory)
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))


class ProjectAPITestCase(CreateManyMixin, CRUDMixin, BaseRESTAPITestCase):
    base_name = 'api:project'
    factory_class = ProjectFactory
    user_factory = ProfileFactory

    exclude_from_update = ('category',)

