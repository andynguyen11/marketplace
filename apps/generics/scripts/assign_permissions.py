from accounts.models import Profile, SkillTest
from generics.viewsets import assign_crud_permissions

def permission_assigner(queryset=[], user_extractor=lambda obj: obj.user):
    for obj in queryset:
        user = user_extractor(obj)
        assign_crud_permissions(user, obj)

def assign_permissions():
    migrations = [{
        'queryset': SkillTest.objects.all(),
        'user_extractor': lambda skilltest: skilltest.profile
    }, {
        'queryset': Profile.objects.all(),
        'user_extractor': lambda profile: profile
    }]
    for m in migrations:
        permission_assigner(**m)

def run(): assign_permissions()
