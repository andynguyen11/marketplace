from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.http import HttpResponseForbidden

from api.serializers import CompanySerializer, JobSerializer
from notifications.signals import notify

from api.permissions import IsOwner
from accounts.models import Profile
from business.models import Company, Job, Project
from postman.api import pm_write


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

    def get_queryset(self):
        return Company.objects.filter(primary_contact=self.request.user)


class JobViewSet(ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    renderer_classes = (JSONRenderer,)
    parser_classes = (FileUploadParser, JSONParser, MultiPartParser)
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        project = Project.objects.get(id=self.request.data['project'])
        job = serializer.save(
            project=project,
            developer=self.request.user,
            equity=self.request.data['equity'],
            cash=self.request.data['cash'],
            hours=self.request.data['hours'],
            bid_message=self.request.data['bid_message']
        )
        message = pm_write(
            sender=self.request.user,
            recipient=Profile.objects.get(id=job.project.project_manager_id),
            subject='New Bid from {0} for {1}'.format(
                self.request.user.first_name or self.request.user.email, project.title),
            body=job.bid_message,
            job=job,
        )
        notify.send(
            message.recipient,
            recipient=message.recipient,
            verb=u'received a new bid',
            action_object=job,
        )
