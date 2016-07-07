import datetime, os, random, six
from django.db.models import Manager
from rest_assured.testcases import (
    BaseRESTAPITestCase,
    CreateAPITestCaseMixin,
    UpdateAPITestCaseMixin,
    ReadRESTAPITestCaseMixin,
    DestroyAPITestCaseMixin )
from django.db import models
from django.core import management
from django.conf import settings

from generics.factories import all_factory_fields, factory_model 

from rest_framework.test import APITransactionTestCase


def dump_to_file(model, path):
    #management.call_command(name, *args, **options)
    with open(os.path.join(path, model._meta.db_table + '.json'), 'w+') as f:
        management.call_command('dump_object', model._meta.label, '*',  stdout=f)

# TODO primary_contact_id is null when you try to save project
def deep_save(model):
    if model.pk is None:
        save_related(model)
        model.save()

def save_related(model):
    fields = [f.name for f in model._meta.fields]
    for field in fields:
        value = getattr(model, field)
        if isinstance(value, models.Model):
            deep_save(value)
            if hasattr(model, field + '_id'):
                setattr(model, field + '_id', value.id)

class CreateMixin(CreateAPITestCaseMixin):

    def get_unsaved_object(self):
        if(self.object and self.object.pk):
            self.object.delete()
        self.object = self.get_factory_class().build()

    def get_create_data(self):
        self.get_unsaved_object()
        data = {}
        for key in all_factory_fields(self.factory_class) :
            value = getattr(self.object, key)
            if value is not None:
                if isinstance(value, models.Model):
                    deep_save(value)
                    data[key] = value.pk
                else:
                    data[key] = value
        return data

def field_subset(fields, percent):
    count = int(len(fields) * percent)
    return random.sample(fields, count)

def read_file(f):
    f.open()
    val = f.read()
    f.close()
    return val

def identity(item):
    if(isinstance(item, models.fields.files.FieldFile)):
        return read_file(item)
    return item

class UpdateMixin(UpdateAPITestCaseMixin):

    update = 1 #'random'
    exclude_from_update = tuple()

    def path(self, method, attr):
        return '.'.join([self.base_name, method, attr])

    def assertEqual(self, first, second, msg=None):
        first = identity(first)
        second = identity(second)
        return super(UpdateMixin, self).assertEqual(first, second, msg)

    def assertIsSubset(self, path, parent, subset):
        try:
            self.assertTrue(set(parent).issubset(subset))
        except AssertionError, e:
            raise AssertionError('%s: %s is not a subset of %s' % (path, subset, parent))

    def _update_check_db(self, obj, data=None, results=None):
        """ completely overriding the equivalence checks for more descriptive errors """
        if data is None:
            data = self._UpdateAPITestCaseMixin__data

        if results is None:
            results = self._UpdateAPITestCaseMixin__results or {}

        for key, value in six.iteritems(data):
            # check if ``obj`` is a dict to allow overriding ``_update_check_db()``
            # and perform checks on a serialized object
            if isinstance(obj, dict):
                attribute = obj.get(key)
                if isinstance(attribute, list):
                    self.assertListEqual(attribute, value)
                    continue
            else:
                # check for foreign key
                if hasattr(obj, '%s_id' % key):
                    related = getattr(obj, key)
                    attribute = self.get_relationship_value(related, key)
                else:
                    attribute = getattr(obj, key)
                    # Handle case of a ManyToMany relation
                    if isinstance(attribute, Manager):
                        items = {self.get_relationship_value(item, key) for item in attribute.all()}
                        self.assertIsSubset(self.path('update', key), items, value)
                        continue

            self.assertEqual(attribute, results.get(key, value))

    def get_update_data(self):
        data = {}
        update_object = self.get_object(self.get_factory_class())
        update_percent = random.random() if self.update == 'random' else self.update
        for key in field_subset(all_factory_fields(self.factory_class), update_percent):
            value = getattr(update_object, key)
            if value is not None and key not in self.exclude_from_update + ('pk', 'id', 'date_created'):
                data[key] = value.pk if isinstance(value, models.Model) else value

        return data

    def get_relationship_value(self, related_obj, key):
        return getattr(related_obj, getattr(self, 'relationship_lookup_field'))

    def get_update_results(self, data=None):
        data = self._UpdateAPITestCaseMixin__data or data
        for key, value in data.items():
            if isinstance(value, Manager):
                data[key] = {self.get_relationship_value(item, key) for item in value.all()}
        return data


        
class CreateManyMixin(CreateMixin):

    create_count = 10

    fixture_dir = settings.FIXTURES_DIR

    def test_create_many(self, *args, **kwargs):
        response = []
        for i in xrange(0, self.create_count):
            resp, result = self.test_create( *args, **kwargs)
            self.assertEqual(resp.status_code, 201)
            response.append(result)

        if settings.GENERATE_TEST_FIXTURES:
            dump_to_file(factory_model(self.factory_class), self.fixture_dir)

        return response

class CRUDMixin(CreateMixin, ReadRESTAPITestCaseMixin, UpdateMixin, DestroyAPITestCaseMixin):
    pass

