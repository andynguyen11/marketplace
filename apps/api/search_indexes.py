# haystack automatically updates indexes in search_index.py files
from business.models import Project
from haystack import indexes
from datetime import datetime
from generics.utils import field_names

class ProjectIndex(indexes.ModelSearchIndex, indexes.Indexable):
    skills = indexes.MultiValueField()
    first_name = indexes.CharField(model_attr='project_manager__first_name')
    photo = indexes.CharField(model_attr='project_manager__get_photo')
    city = indexes.CharField()
    state = indexes.CharField()

    class Meta:
        model = Project
        fields = ("title", "slug", "skills", "description", "role", "city",
                  "state", "remote", "first_name", "photo",
                  "estimated_cash", "estimated_equity_percentage", "mix", "short_blurb" )

    def prepare(self, obj):
        self.prepared_data = super(ProjectIndex, self).prepare(obj)
        self.prepared_data['skills'] = [skill.name for skill in obj.skills.all()]
        self.prepared_data['city'] = obj.company.city if obj.company else obj.project_manager.city
        self.prepared_data['state'] = obj.company.state if obj.company else obj.project_manager.state
        return self.prepared_data

    def index_queryset(self, using=None):
       return Project.objects.filter(
           deleted=False,
           approved=True,
           published=True,
           #end_date__gt=datetime.now()
       )
