# haystack automatically updates indexes in search_index.py files
from business.models import Project
from haystack import indexes

class ProjectIndex(indexes.ModelSearchIndex, indexes.Indexable):

    class Meta:
        model = Project
        fields = [ "text" ]
