from datetime import datetime, timedelta
from types import FunctionType, MethodType
from enum import Enum

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models
from notifications.models import Notification
from notifications.signals import notify

from accounts.tasks import connection_request, connection_made
from business.models import Terms
from docusign.models import Document as DocusignDocument
from generics.utils import percentage
from postman.models import Message

def content_type(model):
    return ContentType.objects.get_for_model(model)

class ProductType(Enum):
    flat = 1         # Flat, one time fee
    percentage = 2   # Fee based on a percentage of the transaction amount
    #subscription = 3 # Recurring fee'


class Product(object):
    """
    loom products that can be purchased by users with the given role
    `related_class` is the django model class that the product relates to
    `related_cost_field` is the field to use for price calculations
    `Product`s are meant to be defined by admins, and referenced in `order`s
    """
    _fields = dict(
        id='slug',
        name='full name',
        description='long form description',
        type=ProductType.flat,
        status_flow=tuple(),
        price=1.00,
        fee_percentage=10,
        related_class=models.base.ModelBase,
        related_price_field='cash',
        valid_for=timedelta(),
        on_paid=MethodType)

    @property
    def _required_fields(self):
        return ['id', 'type', 'related_class', 'on_paid']

    @property
    def related_model(self):
        return content_type(self.related_class)

    def _check_field(self, field):
        value = self._fields[field]
        if not hasattr(self, field):
            raise TypeError('<Product %s> must have field %s' % (getattr(self, 'id', 'missing id'), field))
        parent_type = value if isinstance(value, type) else type(value)
        if not isinstance(getattr(self, field), parent_type):
            raise TypeError('<Product %s>.%s must be of type %s, is %s' % (
                getattr(self, 'id', 'missing id'), field, parent_type, type(getattr(self, field))))

    def _validate(self):
        for field in self._required_fields:
            self._check_field(field)

        if(self.type == ProductType.percentage):
            self._check_field('related_price_field')
            self._check_field('fee_percentage')

        if(self.type == ProductType.flat):
            self._check_field('price')

    def __init__(self, *args, **kwargs):
        super(Product, self).__init__(*args, **kwargs)
        self._validate()

    def validate_order(self, order):

        if not hasattr(order, 'payer'): 
            order.payer = order.requester

        if self.type == ProductType.percentage:
           #if not order.recipient: unneeded until connect integration
           #    raise TypeError('Products of type 'percentage' require recipients')
            if not int(getattr(order.related_object, self.related_price_field)) > 0:
                raise TypeError("Products of type 'percentage' require the related_object to have a positive related_price_field")

    def can_pay(self, order, payer):
        if(order.payer != payer):
            raise TypeError("Only order.payer can pay for order %s" % order)
        return True

    def change_status(self, status, order, user):
        raise TypeError("Changing Statuses is disabled by default")

    def calculate_costs(self, order):
        " returns the cost and loom fee amount if applicable "
        if(self.type != ProductType.percentage):
            return self.price, None
        else:
            price = getattr(order.related_object, self.related_price_field)
            return price, percentage(base=price, percent=self.fee_percentage, operation='of')

    @property
    def display_value(self):
        if(self.type != ProductType.percentage):
            return '$%s' % self.price
        else:
            return '%s%% of %s.%s' % (self.fee_percentage, self.related_model.__str__(), self.related_price_field)

    @property
    def as_json(self):
        repr = {
                k: getattr(self, k) for k in self._fields
                if hasattr(self, k) and not k in ['on_paid', 'related_class', 'type'] }
        repr['related_model'] = self.related_class._meta.label
        repr['type'] = self.type.name
        repr['status_flow_actions'] = {}
        for status in getattr(self, 'status_flow', []):
            status_callback = 'on_%s' % status 
            doc = getattr(getattr(self, status_callback), '__doc__', None) if \
                hasattr(self, status_callback) else None
            if(status_callback and doc):
                repr['status_flow_actions'][status_callback] = doc
        
        return repr

    def __str__(self):
        return '%s, %s' % (self.name, self.display_value)


products = { p.id: p for p in [] }
PRODUCT_CHOICES = ((p.id, p.name) for p in products.values())
