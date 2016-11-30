import stripe
from django.conf import settings

class Bunch:
    " generic object from kwargs"
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

stripe.api_key = settings.STRIPE_KEY

def connect_customer(user, stripe_token=None):
    " create a stripe customer with a token from user "
    payload = dict(
        email=user.email,
        description="{0}, {1} - {2}".format(
            user.last_name,
            user.first_name,
            user.company
        )
    )
    if stripe_token:
        payload['source'] = stripe_token
    stripe_customer = stripe.Customer.create(**payload)
    user.stripe = stripe_customer.id
    user.save()
    return stripe_customer

def get_customer(user):
    if user.stripe:
        return stripe.Customer.retrieve(user.stripe)
    else: return connect_customer(user)


def get_customer_and_card(user, stripe_token):
    if user.stripe:
        customer = stripe.Customer.retrieve(user.stripe)
        try:
            card = customer.sources.retrieve(stripe_token)
        except stripe.error.InvalidRequestError, e:
            card = customer.sources.create(source=stripe_token)
    else:
        customer = connect_customer(user, stripe_token),
        card = customer.sources.create(source=stripe_token)
    return customer, card

def add_source(user, stripe_token):
    " add a payment source to an existing customer via a token "
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.create(source=stripe_token)

def get_source(user, source_id):
    " get a specific stripe payment source's details "
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.retrieve(source_id)

def charge_source(amount, application_fee=None, **kwargs):
    " thin wrapper around stripe.Charge.create "
    amount = int(amount * 100)
    if(application_fee):
        kwargs['application_fee'] = int(application_fee * 100)
        amount += kwargs['application_fee']
    return stripe.Charge.create( currency='usd', amount=amount, **kwargs)


# unused until we complete stripe connect integration
def create_account(user):
    return stripe.Account.create(
            managed=True,
            country=user.country or 'US',
            email=user.email)


stripe_helpers = Bunch(
        get_source=get_source,
        add_source=add_source,
        charge_source=charge_source,
        connect_customer=connect_customer,
        get_customer=get_customer,
        create_account=create_account,
        get_customer_and_card=get_customer_and_card)

