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
from business.models import Job, Document, Terms
from docusign.models import DocumentSigner
from docusign.serializers import DocumentSerializer
from payment.models import Order
from payment.serializers import OrderSerializer
from postman.forms import build_payload


class CreditCardView(APIView):
    """
    API view handling creating and updating credit cards
    """

    def post(self, request):

        stripe.api_key = settings.STRIPE_KEY
        token = stripe.Token.create(
            card={
                "number": request.data['number'],
                "exp_month": request.data['month'],
                "exp_year": request.data['year'],
                "cvc": request.data['cvc']
            },
        )
        if request.data['save_card']:
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
        self.send_payment(request, token)
        return Response(status=200, data={"message": "Success"})

    def patch(self, request):
        stripe.api_key = settings.STRIPE_KEY
        stripe_customer = stripe.Customer.retrieve(request.user.stripe)
        if stripe_customer.id == request.data['customer']:
            status = self.send_payment(request, request.data['customer'], request.data['card'])
            return Response(status=200, data={"message": status})
        return Response(status=403)

    def send_payment(self, request, customer, card):
        order = Order.objects.get(job=request.data['job'])
        status = "There was a problem with your payment."
        if order.stats == 'paid':
            return 'Already paid'

        if request.user == order.job.project.project_manager:
            #TODO don't hard code promos
            if request.data['promo'] != 'raiseideas':
                stripe.Charge.create(
                    amount=int(order.price*100),
                    currency='usd',
                    source=card,
                    customer=customer
                )
            order.date_charged = datetime.datetime.now()
            order.status = 'paid'
            order.save()
            status = "Success"
            terms = Terms.objects.get(job=order.job)
            payload = build_payload(request.user, order.job.contractor, terms)
            serializer = DocumentSerializer(data=payload)
            serializer.is_valid(raise_exception=True)
            new_document = serializer.create(serializer.validated_data)
            Document.objects.create(
                docusign_document=self,
                status=self.status,
                type='MSA',
                job=obj.job,
                project=obj.job.project
            )
            signer = DocumentSigner.objects.get(profile=request.user, document=new_document)
            return signer.signing_url
        return status

    def get(self, request):
        stripe.api_key = settings.STRIPE_KEY
        cards = []
        if request.user.stripe:
            stripe_customer = stripe.Customer.retrieve(request.user.stripe)
            cards = stripe_customer.sources.data
        return Response(status=200, data=cards)




class PaymentView(APIView):

    def post(self, request):
        order = Order.objects.get(id=request.POST['job_id'])
        charge = float(request.POST['price'])
        fee = float(request.POST['fee'])
        stripe.api_key = settings.STRIPE_KEY
        stripe_customer = stripe.Customer.retrieve(request.user.stripe)
        stripe_token = stripe.Token.create(
            card=stripe_customer['sources']['data'][0]['id'],
        )
        stripe.Charge.create(
            amount=int(charge*100),
            currency='usd',
            source=stripe_token,
            application_fee=int(fee*100),
            stripe_account=job.provider.stripe,
            statement_descriptor='LawnCall'
        )
        job.date_charged = datetime.datetime.now()
        job.charge = charge
        job.fee = fee
        job.save()


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
