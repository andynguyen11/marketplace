import stripe
from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import Profile
from django.conf import settings

stripe.api_key = settings.STRIPE_KEY

def expand_card(number):
    return { "number": str(number),
            "exp_month": 12,
            "exp_year": 2016,
            "cvc": '123' }

test_data = {
    'user': {'username': 'testuser', 'first_name': 'test', 'last_name': 'user' },
    'cards': [ '4242424242424242', '4012888888881881', '4000056655665556' ],
    'update': {
        'address_city': 'Austin',
        'address_country': 'USA',
        'address_line1': '123 Fake St',
        'address_line2': '123456 Fake Av',
        'address_state': 'Texas',
        'address_zip': '78746',
        'exp_month': 11,
        'exp_year': 2020,
        'metadata': {'random': 'notes'},
        'name': 'Boondock Saints'
        }}

class PaymentSourceAPITests(APITestCase):

    def setUp(self):
        user, created = Profile.objects.get_or_create(username=test_data['user']['username'], defaults=test_data['user'])
        user.set_password('testuser')
        self.client.force_authenticate(user=user)
        self.user = user

    def tearDown(self):
        self.user.delete()

    def create_token_payload(self, card):
        return { 'stripe_token': stripe.Token.create(card=expand_card(card)).id }

    @property
    def payment_sources(self):
        stripe_customer = stripe.Customer.retrieve(self.user.stripe)
        return stripe_customer.sources.data

    def sources_contain_last_four(self, card):
        assert card[-4:] in [ source['last4'] for source in self.payment_sources] 

    def test_create(self):
        " Ensure we can connect a user to stripe "
        card = test_data['cards'][0]
        data = self.create_token_payload(card)
        response = self.client.post(reverse('api:paymentsource'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.sources_contain_last_four(card)

    def test_add(self):
        " Ensure we can add additional payment sources to a user "
        self.test_create()
        card = test_data['cards'][1]
        data = self.create_token_payload(card)
        response = self.client.put(reverse('api:paymentsource'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.sources_contain_last_four(card)

    def test_update(self):
        " Ensure we can update a given source "
        self.test_create()
        data = {'source_id': self.payment_sources[0].id }
        data.update(test_data['update'])
        response = self.client.patch(reverse('api:paymentsource'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for k, v in test_data['update'].items():
            self.assertEqual(response.data[k], v)

    def test_delete(self):
        " Ensure we can delete a given source once created"
        self.test_create()
        data = {'source_id': self.payment_sources[0].id }
        response = self.client.delete(reverse('api:paymentsource'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        assert data['source_id'] not in [ source['id'] for source in self.payment_sources] 


