import datetime, os, random
from rest_assured.testcases import (
    BaseRESTAPITestCase,
    CreateAPITestCaseMixin,
    UpdateAPITestCaseMixin,
    ReadRESTAPITestCaseMixin,
    DestroyAPITestCaseMixin )
from django.db import models
from django.core import management
from django.conf import settings

from generics.factories import buildGenericModelFactory, factory_model_fields, factory_model

from rest_framework.test import APITransactionTestCase


def dump_to_file(model, path):
    #management.call_command(name, *args, **options)
    with open(os.path.join(path, model._meta.db_table + '.json'), 'w+') as f:
        management.call_command('dump_object', model._meta.label, '*',  stdout=f)


def deep_save(model):
    if model.pk is None:
        save_related(model)
        model.save()

def save_related(model):
    for field in model._meta.fields:
        value = getattr(model, field.name)
        if isinstance(value, models.Model):
            deep_save(value)

class CreateMixin(CreateAPITestCaseMixin):

    def get_unsaved_object(self):
        self.object = self.get_object(self.get_factory_class())
        self.object.delete()

    def get_create_data(self):
        data = {}
        for key in factory_model_fields(self.factory_class):
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

    def assertEqual(self, first, second, msg=None):
        first = identity(first)
        second = identity(second)
        return super(UpdateMixin, self).assertEqual(first, second, msg)

    def get_update_data(self):
        data = {}
        update_object = self.get_object(self.get_factory_class())
        update_percent = random.random() if self.update == 'random' else self.update
        for key in field_subset(factory_model_fields(self.factory_class), update_percent):
            value = getattr(update_object, key)
            if value is not None and key not in ['pk', 'id', 'date_created']:
                data[key] = value.pk if isinstance(value, models.Model) else value
        return data

    def get_relationship_value(self, related_obj, key):
        return getattr(related_obj, getattr(self, 'relationship_lookup_field'))


        
class CreateManyMixin(CreateMixin):

    create_count = 10

    fixture_dir = settings.FIXTURES_DIR

    def test_create_many(self, *args, **kwargs):
        response = []
        if self.object:
            self.object.delete()
        for i in xrange(0, self.create_count):
            self.get_unsaved_object()
            response.append(self.test_create( *args, **kwargs))

        if settings.GENERATE_TEST_FIXTURES:
            dump_to_file(factory_model(self.factory_class), self.fixture_dir)

        return response

class CRUDMixin(CreateMixin, ReadRESTAPITestCaseMixin, UpdateMixin, DestroyAPITestCaseMixin):
    pass

