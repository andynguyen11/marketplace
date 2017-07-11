import datetime
import stripe
import json
from requests.exceptions import ConnectionError

from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.encoding import smart_str
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework import authentication, permissions, viewsets
from django.conf import settings

from accounts.models import Profile
from accounts.serializers import ObfuscatedProfileSerializer
from generics.viewsets import ImmutableModelViewSet
from business.models import Document, Terms
from business.serializers import DocumentSerializer
from docusign.models import Document as DocusignDocument
from business.products import products
from payment.models import Promo, get_promo, Invoice, InvoiceItem
from payment.helpers import stripe_helpers
from payment.permissions import InvoicePermissions
from payment.serializers import InvoiceSerializer, StripeJSONSerializer, StripeWebhookSerializer
from proposals.models import Proposal

stripe.api_key = settings.STRIPE_KEY

#refactor
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

#refactor
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


class StripeConnectViewSet(ViewSet):
    """ Generic API StripeView """
    permission_classes = (IsAuthenticated, )

    def update_stripe_account(self, user, stripe_account):
        user.stripe_connect = stripe_account.id
        user.verification = stripe_account.legal_entity.verification.status
        if 'payouts_enabled' in stripe_account:
            user.payouts_enabled = stripe_account.payouts_enabled
        user.save()

    def create(self, request):
        try:
            serializer = StripeJSONSerializer(data=request.data)
            if serializer.is_valid():
                stripe_token = serializer.data['data'].pop('external_account')
                # Need to create, fetch, then update in order to trigger Stripe account update webhook
                stripe_response = stripe.Account.create(
                    type='custom',
                    email=request.user.email,
                    **serializer.data['data']
                )
                stripe_account = stripe.Account.retrieve(
                    id=stripe_response.id
                )
                stripe_account.external_account = stripe_token
                stripe_account = stripe_account.save()
                self.update_stripe_account(request.user, stripe_account)
                return Response(stripe_response, status=201)
            else:
                return Response(serializer.errors, status=400)
        except stripe.StripeError as e:
            error_data = {u'error': smart_str(e) or u'Unknown error'}
            return Response(error_data, status=400)

    def list(self, request):
        if request.user.stripe_connect:
            account = stripe.Account.retrieve(request.user.stripe_connect)
            return Response(status=200, data=account)
        else:
            return Response(status=200)

    #def partial_update(self, request):
    #    try:
    #        serializer = StripeJSONSerializer(data=request.data)
    #        if serializer.is_valid():
    #            stripe_account = stripe.Account.update(
    #                **serializer.data['data']
    #            )
    #            self.update_stripe_account(request.user)
    #            return Response(stripe_account, status=200)
    #        else:
    #            return Response(serializer.errors, status=400)
    #    except stripe.StripeError as e:
    #        error_data = {u'error': smart_str(e) or u'Unknown error'}
    #        return Response(error_data, status=400)

    @detail_route(methods=['get'])
    def countryspec(self, request, pk=None):
        spec = stripe.CountrySpec.retrieve(pk)
        return Response(spec, status=status.HTTP_200_OK)

class StripeWebhookView(APIView):
    serializer_class = StripeWebhookSerializer

    def validate_webhook(self, webhook_data):
        webhook_id = webhook_data.get('id', None)
        webhook_type = webhook_data.get('type', None)
        webhook_livemode = webhook_data.get('livemode', None)
        is_valid = False

        if webhook_id and webhook_type and webhook_livemode:
            is_valid = True
        return is_valid, webhook_id, webhook_type, webhook_livemode

    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                validated_data = serializer.validated_data
                is_webhook_valid, webhook_id, webhook_type, webhook_livemode = self.validate_webhook(validated_data)

                if is_webhook_valid:
                    stripe_account = validated_data['data']['object']
                    profile = Profile.objects.get(stripe_connect=stripe_account['id'])
                    profile.payouts_enabled = stripe_account['payouts_enabled']
                    profile.verification = stripe_account['legal_entity']['verification']['status']
                    profile.save()
                    return Response(status=200)
                else:
                    error_data = {u'error': u'Webhook must contain id, type and livemode.'}
                    return Response(error_data, status=400)
            else:
                return Response(serializer.errors, status=400)
        except stripe.StripeError as e:
            error_data = {u'error': smart_str(e) or u'Unknown error'}
            return Response(error_data, status=400)