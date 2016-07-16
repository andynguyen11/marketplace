from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.http import HttpResponseForbidden, Http404

from api.serializers import CompanySerializer

from api.permissions import IsOwner
from business.models import Company


class CompanyListCreate(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, ) #TODO Make permissions more granular (public list, authenticated create)


class CompanyDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, IsOwner)
