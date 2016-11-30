from types import FunctionType, MethodType
from django.db import models
from enum import Enum
from generics.utils import percentage
from business.models import Terms, Job
from django.contrib.contenttypes.models import ContentType

from generics.tasks import pm_contact_card_email
from docusign.models import Document as DocusignDocument
from postman.forms import build_payload

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
        price=1.00,
        fee_percentage=10,
        related_class=models.base.ModelBase,
        related_price_field='cash',
        on_ordered=MethodType)

    @property # 
    def _required_fields(self):
        return ['id', 'type', 'related_class', 'on_ordered']

    @property
    def related_model(self):
        return content_type(self.related_class)

    def _check_field(self, field):
        value = self._fields[field]
        if not hasattr(self, field):
            raise TypeError('<Product %s> must have field %s' % (getattr(self, 'id', 'missing id'), field))
        parent_type = value if isinstance(value, type) else type(value)
        if not isinstance(getattr(self, field), parent_type):
            print self.related_class
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
        if self.type == ProductType.percentage:
           #if not order.recipient: unneeded until connect integration
           #    raise TypeError('Products of type 'percentage' require recipients')
            if not int(getattr(order.related_object, self.related_price_field)) > 0:
                raise TypeError("Products of type 'percentage' require the related_object to have a positive related_price_field")

    def can_pay(self, order, payer):
        return True

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
                if hasattr(self, k) and not k in ['on_ordered', 'related_class', 'type'] }
        repr['related_model'] = self.related_class._meta.label
        repr['type'] = self.type.name

        if getattr(self.on_ordered, '__doc__', None):
            repr['on_ordered'] = self.on_ordered.__doc__
        
        return repr

    def __str__(self):
        return '%s, %s' % (self.name, self.display_value)


def generate_contract(contractee, job):
    # TODO THIS IS A BAD THING TO DO
    from business.serializers import DocumentSerializer
    terms = Terms.objects.get(job=job)
    payload = build_payload(contractee, terms.job.contractor, terms)
    serializer = DocumentSerializer(data=payload)
    serializer.is_valid(raise_exception=True)
    new_document = serializer.create(serializer.validated_data)
    signer_url = DocusignDocument.objects.get(id=new_document.docusign_document.id).get_signer_url(contractee)
    pm_contact_card_email.delay(job.id)
    return signer_url

class ConnectJob(Product):
    id = 'connect_job'
    name = 'Connect Contractor and Contractee for a bid/project'
    description = 'Removes the PII filter from chat, before contract has been signed'
    type = ProductType.flat
    price = 300.00
    related_class = Job

    def can_pay(self, order, payer):
        if order.related_object.status != 'pending':
            raise TypeError("This job has already been connected")

    def on_ordered(self, order):
        job = order.related_object
        job.status = 'connected'
        job.save()
        order.result = "%s, status: '%s'" % (job.__str__(), job.status)
        print order.result
        order.save()
        return order

class StartJob(Product):
    id = 'start_job'
    name = 'Start Job'
    description = 'Contractee pays contractor and a contract is generated'
    type = ProductType.percentage
    fee_percentage = 5
    related_class = Job
    related_price_field = 'cash'

    def on_ordered(self, order):
        order.result = generate_contract(order.payer, order.related_object)
        order.save()
        return order


class TestLog(Product):
    id = 'test_log'
    name = 'Test Logging'
    description = 'Just log the related object'
    type = ProductType.flat
    price = 5.00
    related_class = Job

    def on_ordered(self, order):
        order.result = 'test_log of related_object: %s' % order.related_object.__repr__()
        order.save()
        return order

products = { p.id: p for p in [StartJob(), TestLog(), ConnectJob()] }
PRODUCT_CHOICES = ((p.id, p.name) for p in products.values())
