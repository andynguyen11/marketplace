from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from api.permissions import IsOwnerOrIsStaff, BidPermission
from api.serializers.projects import JobSerializer, TermsSerializer
from business.models import Job, Terms


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    # renderer_class = (JSONRenderer,)
    permission_classes = (IsAuthenticated, BidPermission)


class TermsListCreate(generics.ListCreateAPIView):
    serializer_class = TermsSerializer
    permission_classes = (IsAuthenticated, ) #TODO add Term permission

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            _ = (e for e in queryset)
            serializer = self.get_serializer(queryset, many=True)
        except TypeError:
            serializer = self.get_serializer(queryset)
        return Response(serializer.data)


    def get_queryset(self):
        queryset = Terms.objects.all()
        bid_id = self.request.query_params.get('bid', None)
        if bid_id is not None:
            bid = Job.objects.get(id=bid_id)
            queryset, created = Terms.objects.get_or_create(bid=bid)
        return queryset


class TermsRetrieveUpdate(generics.RetrieveUpdateAPIView):
    queryset = Terms.objects.all()
    serializer_class = TermsSerializer
    permission_classes = (IsAuthenticated, )
