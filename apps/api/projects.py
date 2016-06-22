from generics.viewsets import NestedModelViewSet
from rest_framework import viewsets
from .serializers import ProjectSerializer, InfoSerializer
from business.models import Project, ConfidentialInfo


class InfoViewSet(NestedModelViewSet):
    ""
    queryset = ConfidentialInfo.objects.all()
    serializer_class = InfoSerializer
    parent_keys = ('project',)

class ProjectViewSet(viewsets.ModelViewSet):
    ""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
