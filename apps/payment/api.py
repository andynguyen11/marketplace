import datetime, stripe
from requests.exceptions import ConnectionError

from django.shortcuts import redirect
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework import authentication, permissions, viewsets
from apps.api.permissions import ProductOrderPermission
from django.conf import settings

from accounts.models import Profile
from generics.tasks import pm_contact_card_email
from generics.viewsets import ImmutableModelViewSet
from business.models import Job, Document, Terms
from business.serializers import DocumentSerializer
from docusign.models import Document as DocusignDocument
from business.products import products
from payment.models import ProductOrder, Order, Promo, get_promo
from payment.serializers import OrderSerializer, ProductOrderSerializer, ensure_order_is_payable
from payment.helpers import stripe_helpers 
from postman.forms import build_payload

stripe.api_key = settings.STRIPE_KEY

class StripePaymentSourceView(APIView):
    """
    API view handling create, update, and delete on stripe payment sources
    * `POST` and `PUT` `stripe_token`s authenticated to add sources
    * `PATCH` with a `source_id to update a source
    * `DELETE` with `source_id`
    * `GET` lists sources

    only acts on requesting user's stripe resources
    """
    permission_classes = (IsAuthenticated, )
    update_fields = ( 'address_city', 'address_country', 'address_line1', 'address_line2',
        'address_state', 'address_zip', 'exp_month', 'exp_year', 'metadata', 'name')

    def add_card(self, request):
        user = request.user
        stripe_token = request.data['stripe_token']
        data = stripe_helpers.add_source(user, stripe_token) if user.stripe else stripe_helpers.connect_customer(user, stripe_token)
        return Response(status=201, data=data)

    def post(self, request):
        return self.add_card(request)

    def put(self, request):
        return self.add_card(request)

    def patch(self, request):
        card = stripe_helpers.get_source(request.user, request.data.pop('source_id'))
        for k, v in request.data.items():
            if k in self.update_fields:
                setattr(card, k, v)
        return Response(status=200, data=card.save())

    def delete(self, request):
        data = stripe_helpers.get_source(request.user, request.data.pop('source_id')).delete()
        return Response(status=202, data=data)

    def get(self, request):
        cards = stripe.Customer.retrieve(request.user.stripe).sources.data if request.user.stripe else []
        return Response(status=200, data=cards)


class CreditCardView(APIView):
    """
    API view handling creating and updating credit cards
    """

    def post(self, request):

        stripe_customer = None
        card = request.data['stripeToken']

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
        stripe.api_key = settings.STRIPE_KEY
        stripe_customer = stripe.Customer.retrieve(request.user.stripe)
        if stripe_customer.id == request.data['customer']:
            message, url = self.send_payment(request, request.data['card'], request.data['customer'])
            return Response(status=200, data={"message": message, "url": url})
        return Response(status=403)

    def send_payment(self, request, card, customer=None):
        order = self.build_order(request)

        if order.status == 'paid':
            return ("Already Paid", "/profile/dashboard/")

        if order.can_pay(request.user):
            order.pay(customer, card)
            signer_url = self.generate_contract(request, order.job)
            order.job.status = 'connected'
            order.job.save()
            return ("Success", signer_url)

        return ("There was a problem processing your payment.", "/profile/dashboard/")

    def build_order(self, request):
        job = Job.objects.get(id=request.data['job'])
        order, created = Order.objects.get_or_create(job=job)
        order.add_promo(request.data.get('promo', None))
        return order

    def generate_contract(self, request, job):
        terms = Terms.objects.get(job=job)
        payload = build_payload(request.user, terms.job.contractor, terms)
        serializer = DocumentSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        new_document = serializer.create(serializer.validated_data)
        signer_url = DocusignDocument.objects.get(id=new_document.docusign_document.id).get_signer_url(request.user)
        pm_contact_card_email.delay(job.id)
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
    " Simple Promo checking view "
    permission_classes = (IsAuthenticated, )

    def get(self, request, code=None):
        promo = get_promo(code)
        if not promo:
            return Response(status=404, data='This promo code is invalid.')

        if promo.is_valid_for(request.user):
            if promo.not_expired():
                return Response(status=200, data={'is_valid': True, 'value': promo.value_off})
            else:
                return Response(status=403, data='This promo code has expired.')
        else:
            return Response(status=403, data='This promo code has already been used.')

    def post(self, request):
        return self.get(request, code=request.data.get('promo', None))


class ProductOrderViewSet(ImmutableModelViewSet):
    queryset = ProductOrder.objects.all()
    serializer_class = ProductOrderSerializer
    permission_classes = (IsAuthenticated, ProductOrderPermission)

    @property
    def keys(self):
        return dict(id=self.kwargs.get('id', self.kwargs.get('pk', None)))

    def list(self, request, **kwargs):
        user_orders = self.get_queryset().filter(payer=request.user, **self.request.query_params)
        return Response(self.serializer_class(user_orders, many=True).data)

    def create(self, request, **kwargs):
        request.data['requester'] = self.request.user.id
        return super(ProductOrderViewSet, self).create(request, **kwargs)

    def _update_status(self, order, user, data):
        status = data.get('status', None)
        stripe_token = data.get('stripe_token', None)
        if(order.payer == user):
            payable, details = ensure_order_is_payable(order, stripe_token=stripe_token)
            if not payable:
                return Response(status=400, data={'stripe_token': [
                    'Payer has not specified a payment source for this Order',
                    details ]})

        updated = order.change_status(status, user)
        data = ProductOrderSerializer(updated).data
        return Response(status=204, data=data)

    @detail_route(methods=['post'], permission_classes=(IsAuthenticated, ProductOrderPermission))
    def update_status(self, request, **kwargs):
        return self._update_status(order=self.get_object(), user=request.user, data=request.data)

    @list_route(methods=['post'], permission_classes=(IsAuthenticated,))
    def find_and_update_status(self, request, **kwargs):
        related_object_id = request.data.get('related_object_id', None)
        order = ProductOrder.objects.get(status='pending', _product='connect_job', related_object_id=related_object_id)
        user = request.user

        if not (user in order.involved_users):
            raise PermissionDenied(detail='user not involved in order')

        return self._update_status(order, user, request.data)


