from datetime import datetime
from types import FunctionType, MethodType
from enum import Enum

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models
from notifications.models import Notification
from notifications.signals import notify

from business.models import Terms, Job
from docusign.models import Document as DocusignDocument
from generics.utils import percentage
from generics.tasks import pm_contact_card_email, connection_request, connection_made
from postman.forms import build_payload
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


class ConnectJob(Product):
    id = 'connect_job'
    name = 'Connect Contractor and Contractee for a bid/project'
    description = 'Removes the PII filter from chat, before contract has been signed'
    type = ProductType.flat
    status_flow = (
        # feelancer verified details, waiting on entrepreneur
        'freelancer_is_validating',
        'requested_by_freelancer',
        # entrepreneur verified details, waiting on freelancer
        'entrepreneur_is_validating',
        'requested_by_entrepreneur',
        # Everyone has accepted
        'accepted',
        'paid')
    price = settings.PRODUCTS.get('connect_job', {}).get('price', 99.00)
    related_class = Job

    def validate_order(self, order):
        pattern = 'requested_by_%s' #if order.requester.contact_details.email_confirmed else '%s_is_validating'
        if not hasattr(order, 'payer'): 
            order.payer = order.related_object.owner
        if order.requester == order.payer and not order.request_status:
            order.set_status(pattern % 'entrepreneur')
        elif not order.request_status:
            order.set_status(pattern % 'freelancer')
        return super(ConnectJob, self).validate_order(order)

    def can_pay(self, order, payer):
        if order.status != 'pending' or order.request_status != 'accepted':
            raise TypeError("Order %s cannot be paid in it's current status" % order)
        if payer in order.related_object.contractor.connections.all():
            order.set_status('failed')
            raise TypeError("These users have already been connected")
        return super(ConnectJob, self).can_pay(order, payer)

    def get_role(self, order, user):
        if(user == order.related_object.contractor):
            return 'freelancer', 'entrepreneur'
        if(user == order.related_object.owner):
            return 'entrepreneur', 'freelancer'

    def valid_statuses(self, order, user):
        role, other = self.get_role(order, user)
        if not role:
            return None
        valid_transitions = {
                '%s_is_validating' % role:  ['requested_by_%s' % role, 'cancelled'],
                '%s_is_validating' % role:  ['requested_by_%s' % role, 'cancelled'],
                'requested_by_%s' % other:  ['%s_is_validating' % role, 'accepted', 'cancelled'], }
        if order.requester != user:
            valid_transitions['%s_is_validating' % role].append('accepted')
        if (order.request_status in ['%s_is_validating' % role, 'requested_by_%s' % other]):
            return valid_transitions[order.request_status]
        return ['cancelled']

    def change_status(self, status, order, user):
        if status == order.request_status:
            return
        if(status in self.valid_statuses(order, user)):
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
        "request contact_details from entrepreneur"
        job = order.related_object
        thread = Message.objects.get(job=job)
        notify.send(
            job.contractor,
            recipient=job.owner,
            verb=u'made a connection request for',
            action_object=thread,
            target=thread.job.project,
            type=u'connectionRequest'
        )
        connection_request.delay(job.owner.id, job.contractor.id, thread.id, 'connection-request-entrepreneur')

    def on_requested_by_entrepreneur(self, order):
        "request contact_details from freelancer"
        job = order.related_object
        thread = Message.objects.get(job=job)
        notify.send(
            job.owner,
            recipient=job.contractor,
            verb=u'made a connection request for',
            action_object=thread,
            target=thread.job.project,
            type=u'connectionRequest'
        )
        connection_request.delay(job.contractor.id, job.owner.id, thread.id, 'connection-request-freelancer')

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
        thread = Message.objects.get(job=job)
        if order.requester != job.contractor:
            notify.send(
                job.contractor,
                recipient=job.owner,
                verb=u'has connected with you on',
                action_object=thread,
                target=thread.job.project,
                type=u'connectionAccepted'
            )
        else:
            notify.send(
                job.owner,
                recipient=job.contractor,
                verb=u'has connected with you on',
                action_object=thread,
                target=thread.job.project,
                type=u'connectionAccepted'
            )
        clear_alerts = Notification.objects.filter(action_object_object_id=thread.id, data={"type":"connectionRequest"})
        for alert in clear_alerts:
            alert.unread = False
            alert.save()
        order_context = {
            'date': datetime.now().strftime("%m-%d-%Y"),
            'order_id': order.id,
            'connection_fee': order.price,
            'total': order.price,
            'full_name': '{0} {1}'.format(job.contractor.first_name, job.contractor.last_name)
        }
        connection_made.delay(job.owner.id, job.contractor.id, thread.id, order_context)
        connection_made.delay(job.contractor.id, job.owner.id, thread.id)
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
