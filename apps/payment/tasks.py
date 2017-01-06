from datetime import datetime, timedelta
from django.utils import timezone
from celery import shared_task, signals
import time

from generics.utils import send_mail, send_to_emails, sign_data, parse_signature
from payment.models import ProductOrder
from payment.utils import only_one, is_scheduled
from generics.utils import send_mail, send_to_emails, sign_data, parse_signature


@shared_task
def order_expiring_email(order):
    user = order.product.get_waiting_on(order)
    send_mail('connection-request-expiring', [user],
            getattr(order.product, 'get_expiry_details', lambda o: {"order_id": order.id})(order))

def today():
    now = timezone.now() # timezone-aware datetime.utcnow()
    return timezone.datetime(now.year, now.month, now.day, tzinfo=now.tzinfo)


def expiry_date(order):
    valid_for_delta = getattr(order.product, 'valid_for', None)
    return (not valid_for_delta) or order.date_created + valid_for_delta


def expire_order(order):
    expiry = expiry_date(order)
    if not expiry:
        return

    if today() > expiry:
        order.details = '''
            failure_code: EXPIRED,
            failure_message: Expired due to inaction for %s
            ''' % order.product.valid_for
        order.set_status('failed')
        order.save()
        return order, 'expired'

    elif (today() + timedelta(days=1) >= expiry and
            not (order.details and 'NOTIFIED_OF_PENDING_EXPIRY' in order.details)):
        order_expiring_email(order)
        order.details = '''
            full_status: %s
            NOTIFIED_OF_PENDING_EXPIRY
            ''' % order.full_status
        order.save()
        return order, 'notified'

def timestamp():
    return time.mktime(datetime.now().timetuple())

@shared_task
@only_one()
def expire_orders(delay=dict(hours=3)):
    orders = [expire_order(order) for order in ProductOrder.objects.filter(status='pending')]
    notified = [o[0] for o in orders if o and o[1] == 'notified']
    expired = [o[0] for o in orders if o and o[1] == 'expired']

    if not is_scheduled('payment.tasks.expire_orders'):
       expire_orders.apply_async((delay,), eta=timezone.now() + timedelta(**delay))
    if len(expired) or len(notified):
        return {'expired_orders': expired, 'notified_orders': notified}


@signals.celeryd_after_setup.connect
def begin_loop(sender=None, conf=None, **kwargs):
    if not is_scheduled('payment.tasks.expire_orders', or_running=True):
        expire_orders.delay()

