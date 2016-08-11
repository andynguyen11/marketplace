import datetime
from rest_assured.testcases import BaseRESTAPITestCase
import factory
from django.db import models

from generics.factories import GenericModelFactory
from generics.testcases import CreateManyMixin, CRUDMixin, UpdateMixin
from generics.models import Attachment
from accounts.models import Profile
from business.models import Company, Employee, Project, ProjectInfo, Category
import business.enums as enums

class ProfileFactory(GenericModelFactory):
    class Meta:
        model = Profile
        exclude = ('password',)
    is_active = True
    photo = factory.django.ImageField(from_path='static/images/logo.jpg', file_name='the_file.png')


company_types = [ type_tuple[0] for type_tuple in enums.COMPANY_TYPES]

class CompanyFactory(GenericModelFactory):
    class Meta:
        model = Company

    class Params:
        aliases = {'filing_location': 'city'}

    stripe = factory.Sequence(lambda n: 'stripe-{0}23456'.format(n))
    logo = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png')
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))
    type = factory.Iterator(company_types )


class EmployeeFactory(GenericModelFactory):
    class Meta:
        model = Employee
    company = factory.SubFactory(CompanyFactory)
    profile = factory.SubFactory(ProfileFactory)
    primary = True


class CompanyListAPITestCase(CreateManyMixin, BaseRESTAPITestCase):

    base_name = 'api:company'
    LIST_SUFFIX = ''

    factory_class = CompanyFactory
    user_factory = ProfileFactory

    def get_create_data(self):
        data = super(CreateManyMixin, self).get_create_data()
        data['category'] = data['category'].get_tag_string()
        return data


class ProjectInfoAttachmentFactory(GenericModelFactory):
    class Meta:
        model = Attachment

    tag = 'image'
    file = factory.django.ImageField(from_path='static/images/logo.jpg', filename='project_image.png')


class DetailsFactory(GenericModelFactory):
    class Meta:
        model = ProjectInfo

    class Params:
        aliases = {
            'description': 'paragraph'
        }

    @factory.post_generation
    def create_attachments(self, create, extracted, **kwargs):
        if not create:
            return
        ProjectInfoAttachmentFactory.create(content_object=self)


class ProjectFactory(GenericModelFactory):
    class Meta:
        model = Project

    class Params:
        aliases = {
            'featured': 'boolean',
            'start_date': 'date',
            'end_date': 'date'
        }

    image = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png')
    type = 'technology'
    estimated_hours = 10
    company = factory.SubFactory(CompanyFactory)
    project_manager = factory.SubFactory(ProfileFactory)
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))
    details = factory.RelatedFactory(DetailsFactory, 'project')


class ProjectAPITestCase(CreateManyMixin, CRUDMixin, BaseRESTAPITestCase):
    base_name = 'api:project'
    factory_class = ProjectFactory
    user_factory = ProfileFactory

    exclude_from_update = ('category',)

class ProfileAPITestCase(CreateManyMixin, BaseRESTAPITestCase):
    base_name = 'api:profile'
    factory_class = ProfileFactory
    user_factory = ProfileFactory

