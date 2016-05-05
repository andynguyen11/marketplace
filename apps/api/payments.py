import stripe
from requests.exceptions import ConnectionError

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import authentication, permissions, viewsets
from django.conf import settings

from accounts.models import Profile


class BillingView(APIView):
    """
    API view handling creating and updating credit cards
    """

    def post(self, request):
        stripe.api_key = settings.STRIPE_KEY
        token = request.POST['stripe_token']
        try:
            # Create a Customer
            stripe_customer = stripe.Customer.create(
                source=token,
                description="{0}, {1}".format(
                    request.user.last_name,
                    request.user.first_name,
                )
            )
        except stripe.error.CardError, e:
            body = e.json_body
            error = body['error']['message']
            return Response(status=500, data={"error": error})
        user = request.user
        user.stripe = stripe_customer.id
        user.save()
        return Response(status=200, data={"message": "Success"})

    def patch(self, request):
        stripe.api_key = settings.STRIPE_KEY
        token = request.data['stripe_token']
        user = request.user
        try:
            stripe_customer = stripe.Customer.retrieve(user.stripe)
            stripe_source = stripe_customer.sources.create(source=token)
            stripe_customer.default_source = stripe_source['id']
            stripe_customer.save()
        except stripe.error.CardError, e:
            body = e.json_body
            error = body['error']['message']
            return Response(status=500, data={"error": error})
        return Response(status=200, data={"message": "Success"})