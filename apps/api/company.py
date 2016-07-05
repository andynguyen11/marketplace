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
    permission_classes = (IsAuthenticated, )
    renderer_classes = (JSONRenderer, )


class CompanyDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, IsOwner)

    def get_object(self, pk):
        try:
            return Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        company = self.get_object(pk)
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def get_queryset(self):
        return Company.objects.filter(primary_contact=self.request.user)
