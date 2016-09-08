from rest_framework import serializers
from expertratings.models import SkillTest, SkillTestResult, SkillTestUserFeedback
from generics.utils import field_names
from generics.base_serializers import RelationalModelSerializer

class SkillTestUserFeedbackSerializer(RelationalModelSerializer):
    class Meta:
        model = SkillTestUserFeedback

class SkillTestResultSerializer(RelationalModelSerializer):
    feedback = SkillTestUserFeedbackSerializer(read_only=True)
    class Meta:
        model = SkillTestResult
        fields = field_names(SkillTestResult) + ('feedback',)


class SkillTestSerializer(serializers.ModelSerializer):

    coverage = serializers.CharField()

    class Meta:
        model = SkillTest
        fields = field_names(SkillTest, exclude=('sync_created', 'sync_updated', 'sync_deleted')) + ('coverage',)


