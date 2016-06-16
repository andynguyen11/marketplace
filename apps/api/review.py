from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.http import HttpResponseForbidden

from api.serializers import ReviewSerializer
from api.permissions import IsOwner
from reviews.models import Review


class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = (IsAuthenticated, )
    renderer_classes = (JSONRenderer, )

    def get_queryset(self):
        return Review.objects.filter(developer=self.request.query_params['developer']).order_by('create_date')


class ReviewDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, IsOwner)

    def get_queryset(self):
        return Company.objects.filter(primary_contact=self.request.user)