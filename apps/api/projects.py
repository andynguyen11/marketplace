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
    * various `__operators` can be used on a field, most pertinantly [`__fuzzy`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_fuzziness), i.e. `text__fuzzy=tytle+txt` matches `"title text"`. The fuzz operator can also be used on a per-word basis in the form `text=tytle\~+txt\~` in the url.

    url encoding in general

    * `foo+bar #=> foo AND bar`   
    * `foo,bar #=> foo OR bar`  

    example search: [?featured=true&type=technology,finance&text=titleword+descriptionword](http://localhost:8000/api/search/project?featured=true&type=technology,finance&text=titleword+descriptionword)

    
    """
    index_models = [Project]
    serializer_class = ProjectSearchSerializer
