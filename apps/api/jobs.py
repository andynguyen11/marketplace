from notifications.signals import notify

from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet

from api.permissions import IsOwnerOrIsStaff, BidPermission
from api.serializers import JobSerializer
from business.models import Job
from postman.api import pm_write


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = (IsAuthenticated, BidPermission)

    def perform_create(self, serializer):
        job = serializer.save()
        # TODO We should pass through the message instead of saving it on the job model (LM-91)
        message = pm_write(
            sender=job.developer,
            recipient=job.project.project_manager,
            subject='New Bid from {0} for {1}'.format(job.developer.first_name or job.developer.email, job.project.title),
            body=job.bid_message,
            job=job
        )
        notify.send(message.recipient, recipient=message.recipient, verb=u'received a new bid', action_object=job)
