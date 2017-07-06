import datetime, stripe
from requests.exceptions import ConnectionError

from django.shortcuts import redirect
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework import authentication, permissions, viewsets
from apps.api.permissions import ProductOrderPermission
from django.conf import settings

from accounts.models import Profile
from accounts.serializers import ObfuscatedProfileSerializer
from generics.viewsets import ImmutableModelViewSet
from business.models import Document, Terms
from business.serializers import DocumentSerializer
from docusign.models import Document as DocusignDocument
from business.products import products
from payment.models import ProductOrder, Promo, get_promo, Invoice, InvoiceItem
from payment.helpers import stripe_helpers
from payment.permissions import InvoicePermissions
from payment.serializers import ProductOrderSerializer, InvoiceSerializer, ensure_order_is_payable
from postman.forms import build_payload
from proposals.models import Proposal

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
        card = stripe_helpers.get_source(user=request.user, source_id=request.data.pop('source_id'))
        for k, v in request.data.items():
            if k in self.update_fields:
                setattr(card, k, v)
        return Response(status=200, data=card.save())

    def delete(self, request):
        data = stripe_helpers.get_source(user=request.user, source_id=request.data.pop('source_id')).delete()
        return Response(status=202, data=data)

    def get(self, request):
        cards = stripe.Customer.retrieve(request.user.stripe).sources.data if request.user.stripe else []
        return Response(status=200, data=cards)


class PromoCheck(APIView):
    " Simple Promo checking view "
    permission_classes = (IsAuthenticated, )

    def get(self, request, code=None):
        promo = get_promo(code or request.query_params.get('code', None))
        if not promo:
            return Response(status=400, data='This promo code is invalid.')

        if promo.is_valid_for(request.user):
            if promo.not_expired():
                return Response(status=200, data={'is_valid': True, 'value': promo.value_off})
            else:
                return Response(status=400, data='This promo code has expired.')
        else:
            return Response(status=400, data='This promo code has already been used.')

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
        user_orders = self.get_queryset().filter(payer=request.user, status='paid', **self.request.query_params)
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


class InvoiceViewSet(ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = (IsAuthenticated, InvoicePermissions)
    lookup_field = 'reference_id'

    def list(self, request, **kwargs):
        action = request.query_params.get('action', 'received')
        if action == 'sent':
            invoices = self.get_queryset().filter(sender=request.user)
        if action == 'received':
            invoices = self.get_queryset().filter(recipient=request.user).exclude(status='draft')
        return Response(self.serializer_class(invoices, many=True).data)


class InvoiceRecipientsView(generics.ListAPIView):
    serializer_class = ObfuscatedProfileSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        user = self.request.user
        proposals = Proposal.objects.filter(submitter=user, status='responded')
        recipients = [proposal.project.project_manager for proposal in proposals]
        return set(recipients)

