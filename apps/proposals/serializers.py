from rest_framework import serializers

from proposals.models import Question, Answer, Proposal


class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = ('id', 'ordering', 'text', 'project')


class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Answer


class ProposalSerializer(serializers.ModelSerializer):
    submitter = serializers.SerializerMethodField()

    class Meta:
        model = Proposal

    def get_submitter(self, obj):
        submitter = { k: getattr(obj.submitter, k) for k in [
            'first_name', 'capacity', 'role'
        ]}
        submitter['photo_url'] = obj.submitter.get_photo
        return submitter

