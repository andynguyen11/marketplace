from rest_framework import serializers

from proposals.models import Question, Answer, Proposal


class QuestionSerializer(serializers.ModelSerializer):
    text = serializers.CharField(required=False)

    class Meta:
        model = Question
        fields = ('id', 'ordering', 'text', 'project')


class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Answer


class ProposalSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()
    submitter_profile = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = ('submitter', 'submitter_profile', 'cover_letter', 'equity', 'cash', 'hourly_rate', 'hours', 'status', 'id', 'project', 'create_date', 'message')

    def get_project(self, obj):
        return { 'title': obj.project.title, 'id': obj.project.id }

    def get_submitter_profile(self, obj):
        submitter = { k: getattr(obj.submitter, k) for k in [
            'id', 'first_name', 'capacity', 'role',
        ]}
        submitter['photo_url'] = obj.submitter.get_photo
        return submitter

