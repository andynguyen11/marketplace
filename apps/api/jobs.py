from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet

from api.permissions import IsOwnerOrIsStaff, BidPermission
from api.serializers import JobSerializer
from business.models import Job


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    # renderer_class = (JSONRenderer,)
    permission_classes = (IsAuthenticated, BidPermission)
