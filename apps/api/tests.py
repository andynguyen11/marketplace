import datetime
from rest_assured.testcases import BaseRESTAPITestCase
import factory
from django.db import models

from generics.factories import buildGenericModelFactory
from generics.testcases import CreateManyMixin, CRUDMixin
from accounts.models import Profile
from business.models import Company, Project, ConfidentialInfo

TagFactory = buildGenericModelFactory( Company.category.tag_model,
        protected = False,
        count = 1)

ProfileFactory = buildGenericModelFactory(Profile, 
        exclude = ('password',),
        is_active = True,
 )

CompanyFactory = buildGenericModelFactory(Company,
        stripe = factory.Sequence(lambda n: 'stripe-{0}23456'.format(n)),
        logo = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png'),
        primary_contact = factory.SubFactory(ProfileFactory),
        category = factory.SubFactory(TagFactory))

class CompanyListAPITestCase(CreateManyMixin, BaseRESTAPITestCase):

    base_name = 'api:company'
    LIST_SUFFIX = ''

    factory_class = CompanyFactory
    user_factory = ProfileFactory

ProjectFactory = buildGenericModelFactory(Project,
        types={'featured': 'boolean'},
        image = factory.django.ImageField(from_path='static/images/logo.jpg', filename='the_file.png'),
        type = 'technology',
        estimated_hours = 10,
        project_manager = factory.SubFactory(ProfileFactory),
        company = factory.SubFactory(CompanyFactory),
        category = factory.SubFactory(TagFactory),
        secondary_category = factory.SubFactory(TagFactory),
        location = factory.SubFactory(TagFactory))

class ProjectFixtureAPITestCase(CreateManyMixin,CRUDMixin, BaseRESTAPITestCase):
    base_name = 'api:project'
    factory_class = ProjectFactory
    user_factory = ProfileFactory


