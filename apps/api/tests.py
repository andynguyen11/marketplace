from rest_assured.testcases import BaseRESTAPITestCase

from generics.factories import CompanyFactory, GenericModelFactory, ProfileFactory, ProjectFactory
from generics.testcases import CreateManyMixin, CRUDMixin, UpdateMixin


class CompanyListAPITestCase(CreateManyMixin, BaseRESTAPITestCase):

    base_name = 'api:company'
    LIST_SUFFIX = ''

    factory_class = CompanyFactory
    user_factory = ProfileFactory

    def get_create_data(self):
        data = super(CreateManyMixin, self).get_create_data()
        data['category'] = data['category'].get_tag_string()
        return data


class ProjectAPITestCase(CreateManyMixin, CRUDMixin, BaseRESTAPITestCase):
    base_name = 'api:project'
    factory_class = ProjectFactory
    user_factory = ProfileFactory
    exclude_from_update = ('category',)


class ProfileAPITestCase(CreateManyMixin, BaseRESTAPITestCase):
    base_name = 'api:profile'
    factory_class = ProfileFactory
    user_factory = ProfileFactory
