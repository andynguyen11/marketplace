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


def add_source(user, stripe_token, metadata={}):
    " add a payment source to an existing customer via a token "
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.create(source=stripe_token, metadata=metadata)


def metadata_filter(sub):
    """
    Find all sources that have the same slice of metadata.
    Stripe seems to cast all metadata to strings
    """
    def match(full):
        for k, v in sub.items():
            if not str(full.metadata.get(k, None)) == str(v):
                return False
        return True
    return match

def get_source(user=None, customer=None, source_id=None, metadata={}):
    " get a specific stripe payment source's details "
    if isinstance(source_id, stripe.Card):
        return source_id
    if user:
        return get_source(
                customer=stripe.Customer.retrieve(user.stripe),
                source_id=source_id,
                metadata=metadata)
    if source_id:
        return customer.sources.retrieve(source_id)
    matches = list({ c['fingerprint']: c for c in filter(metadata_filter(metadata), customer.sources.data) }.values())
    assert len(matches) == 1
    return matches[0]

def get_customer_and_card(user, stripe_token=None, metadata={}):
    if user.stripe:
        customer = stripe.Customer.retrieve(user.stripe)
        try:
            card = get_source(customer=customer, source_id=stripe_token, metadata=metadata)
        except stripe.error.InvalidRequestError, e:
            card = customer.sources.create(source=stripe_token)
    else:
        customer = connect_customer(user, stripe_token),
        card = customer.sources.create(source=stripe_token)
    card.metadata = metadata
    card.save()
    return customer, card

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

