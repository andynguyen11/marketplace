from generics.viewsets import NestedModelViewSet
from drf_haystack.viewsets import HaystackViewSet
from rest_framework import viewsets
from .serializers import ProjectSerializer, ProjectSearchSerializer, InfoSerializer
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

class ProjectSearchView(HaystackViewSet):
    """
    supports [drf-haystack queries](https://drf-haystack.readthedocs.io/en/latest/01_intro.html#query-time):

    * Every primary (non-foreign) field on the model is available for explicit query (`featured=true&type=technology`)  
    * Has an additional `text` field defined in a data template `apps/business/templates/search/indexes/business/project_text.txt`  

    url encoding in general

    * `foo+bar #=> foo AND bar`   
    * `foo,bar #=> foo OR bar`  

    example search: [?featured=true&type=technology,finance&text=titleword+descriptionword](http://localhost:8000/api/search/project?featured=true&type=technology,finance&text=titleword+descriptionword)

    TODO: searches aren't fuzzy or smart, this is just a barebones implementation. [More haystack configuration needed](https://wellfire.co/learn/custom-haystack-elasticsearch-backend/).
    """
    index_models = [Project]
    serializer_class = ProjectSearchSerializer
