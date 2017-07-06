import datetime
import factory
from generics.factories import GenericModelFactory, image_factory, zip_factory
from generics.models import Attachment
from accounts.models import Profile
from business.models import Company, Employee, Project, Terms, Category
import business.enums as enums
from notifications.signals import notify

from django.contrib.auth.hashers import make_password

@factory.django.mute_signals(notify)
class ProfileFactory(GenericModelFactory):
    class Meta:
        model = Profile
        django_get_or_create = ('email',)

    is_active = True
    photo = image_factory()
    zipcode = zip_factory()
    password = make_password("password")


def enum_iterator(enum):
    types = [ type_tuple[0] for type_tuple in enum]
    return factory.Iterator(types)

class CompanyFactory(GenericModelFactory):
    class Meta:
        model = Company

    class Params:
        aliases = {'filing_location': 'city'}

    stripe = factory.Sequence(lambda n: 'stripe-{0}23456'.format(n))
    logo = image_factory()
    category = factory.Sequence(lambda n: 'cat-{0}'.format(n))
    type = enum_iterator(enums.COMPANY_TYPES)


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
        aliases = {
            'featured': 'boolean',
            'start_date': 'date',
            'end_date': 'date'
        }

    type = enum_iterator(enums.PROJECT_TYPES)
    estimated_hours = factory.Iterator([10, 20, 30, 40])
    company = factory.SubFactory(CompanyFactory)
    project_manager = factory.SubFactory(ProfileFactory)
    details = factory.RelatedFactory(DetailsFactory, 'project')


