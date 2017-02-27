from rest_framework import serializers

from proposals.models import Question


class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = ('id', 'text', 'project')