import stripe
from django.conf import settings

class Bunch:
    " generic object from kwargs"
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

stripe.api_key = settings.STRIPE_KEY

def connect_customer(user, stripe_token):
    " create a stripe customer with a token from user "
    stripe_customer = stripe.Customer.create(
        source=stripe_token,
        email=user.email,
        description="{0}, {1} - {2}".format(
            user.last_name,
            user.first_name,
            user.company
        )
    )
    user.stripe = stripe_customer.id
    user.save()
    return stripe_customer

def add_source(user, stripe_token):
    " add a payment source to an existing customer via a token "
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.create(source=stripe_token)

def get_source(user, source_id):
    " get a specific stripe payment source's details "
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.retrieve(source_id)

def charge_source(source, customer, amount, description):
    " thin wrapper around stripe.Charge.create "
    stripe.Charge.create(
        currency='usd',
        amount=int(amount * 100),
        source=source,
        customer=customer,
        description=description
    )

stripe_helpers = Bunch(get_source=get_source, add_source=add_source, charge_source=charge_source, connect_customer=connect_customer)

