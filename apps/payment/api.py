import datetime
import stripe
from requests.exceptions import ConnectionError

from django.shortcuts import redirect
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework import authentication, permissions, viewsets
from django.conf import settings

from accounts.models import Profile
from generics.tasks import contact_card_email
from business.models import Job, Document, Terms
from business.serializers import DocumentSerializer
from docusign.models import Document as DocusignDocument
from payment.models import Order, Promo
from payment.serializers import OrderSerializer
from postman.forms import build_payload


stripe.api_key = settings.STRIPE_KEY

def connect_customer(user, stripe_token):
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
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.create(source=stripe_token)

def get_source(user, source_id):
    stripe_customer = stripe.Customer.retrieve(user.stripe)
    return stripe_customer.sources.retrieve(source_id)


class StripePaymentSourceView(APIView):
    """
    API view handling create, update, and delete on stripe payment sources

    """
    permission_classes = (IsAuthenticated, )
    update_fields = ( 'address_city', 'address_country', 'address_line1', 'address_line2',
        'address_state', 'address_zip', 'exp_month', 'exp_year', 'metadata', 'name')

    def add_card(self, request):
        user = request.user
        stripe_token = request.data['stripe_token']
        data = add_source(user, stripe_token) if user.stripe else connect_customer(user, stripe_token)
        return Response(status=201, data=data)

    def post(self, request):
        return self.add_card(request)

    def put(self, request):
        return self.add_card(request)

    def patch(self, request):
        card = get_source(request.user, request.data.pop('source_id'))
        for k, v in request.data.items():
            if k in self.update_fields:
                setattr(card, k, v)
        return Response(status=200, data=card.save())

    def delete(self, request):
        data = get_source(request.user, request.data.pop('source_id')).delete()
        return Response(status=202, data=data)

    def get(self, request):
        cards = stripe.Customer.retrieve(request.user.stripe).sources.data if request.user.stripe else []
        return Response(status=200, data=cards)


class CreditCardView(APIView):
    """
    API view handling creating and updating credit cards
    """

    def post(self, request):
        #TODO Handle promos dynamically
        if request.data.get('promo', None) == 'raiseideas':
            job = Job.objects.get(id=request.data['job'])
            order = self.handle_promo_order(job, 'raiseideas')
            url = self.generate_contract(request, job)
            return Response(status=200, data={"message": "Success", "url": url})
        stripe.api_key = settings.STRIPE_KEY
        stripe_customer = None
        card=request.data['stripeToken']
        if request.data['saveCard']:
            if request.user.stripe:
                try:
                    stripe_customer = stripe.Customer.retrieve(request.user.stripe)
                    card = stripe_customer.sources.create(source=card)
                except stripe.error.CardError, e:
                    body = e.json_body
                    error = body['error']['message']
                    return Response(status=500, data={"error": error})
            else:
                try:
                    # Create a Customer
                    stripe_customer = stripe.Customer.create(
                        source=card,
                        description="{0}, {1} - {2}".format(
                            request.user.last_name,
                            request.user.first_name,
                            request.user.company
                        )
                    )
                    card=stripe_customer.sources.data[0].id
                except stripe.error.CardError, e:
                    body = e.json_body
                    error = body['error']['message']
                    return Response(status=500, data={"error": error})
            user = request.user
            user.stripe = stripe_customer.id
            user.save()
        message, url = self.send_payment(request, card, stripe_customer)
        return Response(status=200, data={"message": message, "url": url})

    def patch(self, request):
        #TODO don't hard code promos
        if request.data.get('promo', None) == 'raiseideas':
            job = Job.objects.get(id=request.data['job'])
            order = self.handle_promo_order(job, 'raiseideas')
            url = self.generate_contract(request, job)
            return Response(status=200, data={"message": "Success", "url": url})
        stripe.api_key = settings.STRIPE_KEY
        stripe_customer = stripe.Customer.retrieve(request.user.stripe)
        if stripe_customer.id == request.data['customer']:
            message, url = self.send_payment(request, request.data['card'], request.data['customer'])
            return Response(status=200, data={"message": message, "url": url})
        return Response(status=403)

    def send_payment(self, request, card, customer=None):
        job = Job.objects.get(id=request.data['job'])
        order, created = Order.objects.get_or_create(job=job)
        if order.status == 'paid':
            return ("Already Paid", "/profile/dashboard/")

        if request.user == order.job.project.project_manager:
            stripe.Charge.create(
                amount=int(order.price*100),
                currency='usd',
                source=card,
                customer=customer,
                description='Loom fee for "{0}"'.format(order.job.project.title)
            )
            order.date_charged = datetime.datetime.now()
            order.status = 'paid'
            order.save()
            signer_url = self.generate_contract(request, job)
            #contact_card_email.delay(job)
            return ("Success", signer_url)
        return ("There was a problem processing your payment.", "/profile/dashboard/")

    def handle_promo_order(self, job, promo_code):
        #TODO We need to handle promos dynamically
        order, created = Order.objects.get_or_create(job=job)
        try:
            promo = Promo.objects.get(code=promo_code)
            order.promo = promo
        except Promo.DoesNotExist:
            #TODO Return and handle error
            pass
        order.price = 0
        order.status = 'paid'
        order.date_charged = datetime.datetime.now()
        order.save()

    def generate_contract(self, request, job):
        terms = Terms.objects.get(job=job)
        payload = build_payload(request.user, terms.job.contractor, terms)
        serializer = DocumentSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        new_document = serializer.create(serializer.validated_data)
        signer_url = DocusignDocument.objects.get(id=new_document.docusign_document.id).get_signer_url(request.user)
        return signer_url

    def get(self, request):
        stripe.api_key = settings.STRIPE_KEY
        cards = []
        if request.user.stripe:
            stripe_customer = stripe.Customer.retrieve(request.user.stripe)
            cards = stripe_customer.sources.data
        return Response(status=200, data=cards)


class OrderListCreate(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            _ = (e for e in queryset)
            serializer = self.get_serializer(queryset, many=True)
        except TypeError:
            serializer = self.get_serializer(queryset)
        return Response(serializer.data)

    def get_queryset(self):
        profile = self.request.user
        queryset = Order.objects.filter(job__project__project_manager=profile)
        job_id = self.request.query_params.get('job', None)
        if job_id is not None:
            job = Job.objects.get(id=job_id)
            queryset, created = Order.objects.get_or_create(job=job)
        return queryset


class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, )


class PromoCheck(APIView):
    #TODO This is a hack implementation, revisit and apply promo to order object
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        try:
            promo = Promo.objects.get(code=request.data.get('promo', 'wrongpromo'))
        except Promo.DoesNotExist:
            return Response(status=500, data='This promo code is invalid.')

        if request.user in promo.customers.all():
            return Response(status=500, data='This promo code has already been used.')

        promo.customers.add(request.user)
        promo.save()

        return Response(status=200, data={'message': 'Promo successfully applied.'})
