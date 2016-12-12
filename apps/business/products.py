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
        status_flow=tuple(),
        price=1.00,
        fee_percentage=10,
        related_class=models.base.ModelBase,
        related_price_field='cash',
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
        for status in self.status_flow:
            status_callback = 'on_%s' % status 
            doc = getattr(getattr(self, status_callback, {}), '__doc__', None)
            if(status_callback and doc):
                repr['status_flow_actions'][status_callback] = doc
        
        return repr

    def __str__(self):
        return '%s, %s' % (self.name, self.display_value)


class ConnectJob(Product):
    id = 'connect_job'
    name = 'Connect Contractor and Contractee for a bid/project'
    description = 'Removes the PII filter from chat, before contract has been signed'
    type = ProductType.flat
    status_flow = (
        # feelancer verified details, waiting on entrepeneur
        'requested_by_freelancer',
        # entrepeneur verified details, waiting on freelancer
        'requested_by_entrepeneur',
        # Everyone has accepted
        'accepted',
        'paid')
    price = 300.00
    related_class = Job

    def validate_order(self, order):
        if not hasattr(order, 'payer'): 
            order.payer = order.related_object.owner
        if order.requester == order.payer:
            order.set_status('requested_by_entrepeneur')
        else:
            order.set_status( 'requested_by_freelancer')
        return super(ConnectJob, self).validate_order(order)

    def can_pay(self, order, payer):
        if order.status != 'pending' or order.request_status != 'accepted':
            raise TypeError("Order %s cannot be paid in it's current status" % order)
        if payer in order.related_object.contractor.connections.all():
            raise TypeError("These users have already been connected")
        return super(ConnectJob, self).can_pay(order, payer)
    
    def valid_update(self, order, user):
        if (order.request_status == 'requested_by_entrepeneur' and
                user == order.related_object.contractor):
            return 'freelancer'

        elif (order.request_status == 'requested_by_freelancer' and
                order.related_object.owner == user):
            return 'entrepeneur'

    def change_status(self, status, order, user):
        if((self.valid_update(order, user)) and
           status in ('accepted', 'cancelled')):
            order.set_status(status)
            order.save()
            return order
        else:
            raise TypeError('%s.status change to `%s` from `%s` is not permitted for %s' % (
                order.__repr__(), status, order.full_status, user
                )) # TODO should be a permissions error

    def involved_users(self, order):
        job = order.related_object
        return {job.contractor, job.owner}

    def on_requested_by_freelancer(self, order):
        "request contact_details from entrepeneur"
        pass

    def on_requested_by_entrepeneur(self, order):
        "request contact_details from freelancer"
        pass

    def on_accepted(self, order):
        "pay order with cached card"
        order.pay()

    def on_paid(self, order):
        job = order.related_object
        job.owner.connect(job.contractor)
        job.status = 'connected'
        job.save()
        order.result = "%s, status: '%s'" % (job.__str__(), job.status)
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

    def generate_contract(self, order):
        # TODO THIS IS A BAD THING TO DO
        from business.serializers import DocumentSerializer

        contractee, job = order.payer, order.related_object
        terms = Terms.objects.get(job=job)
        payload = build_payload(contractee, terms.job.contractor, terms)
        serializer = DocumentSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        new_document = serializer.create(serializer.validated_data)
        signer_url = DocusignDocument.objects.get(id=new_document.docusign_document.id).get_signer_url(contractee)
        pm_contact_card_email.delay(job.id)
        return signer_url

    def on_paid(self, order):
        order.result = self.generate_contract(order)
        order.save()
        return order


class TestLog(Product):
    id = 'test_log'
    name = 'Test Logging'
    description = 'Just log the related object'
    type = ProductType.flat
    price = 5.00
    related_class = Job

    def on_paid(self, order):
        order.result = 'test_log of related_object: %s' % order.related_object.__repr__()
        order.save()
        return order

products = { p.id: p for p in [StartJob(), TestLog(), ConnectJob()] }
PRODUCT_CHOICES = ((p.id, p.name) for p in products.values())
