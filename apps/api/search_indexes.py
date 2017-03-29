# haystack automatically updates indexes in search_index.py files
from business.models import Project
from haystack import indexes
from datetime import datetime
from generics.utils import field_names

class ProjectIndex(indexes.ModelSearchIndex, indexes.Indexable):

    skills = indexes.MultiValueField()

    class Meta:
        model = Project
        fields = field_names(Project, exclude=("video_url", "private_info", "deleted", "approved", "published")) + ("text", "skills")

    @staticmethod
    def prepare_skills(obj):
       return [s.id for s in obj.skills.all()]

    def index_queryset(self, using=None):
       return Project.objects.filter(
           deleted=False,
           approved=True,
           published=True,
           #end_date__gt=datetime.now()
       )
