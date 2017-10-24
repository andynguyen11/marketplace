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


class QASerializer(serializers.ModelSerializer):
    question = serializers.StringRelatedField()
    answer = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ('create_date', 'answerer', 'question', 'answer', )

    def get_answer(self, obj):
        return obj.text


class ProposalSerializer(serializers.ModelSerializer):
    project_details = serializers.SerializerMethodField()
    submitter_profile = serializers.SerializerMethodField()
    questions_and_answers = serializers.SerializerMethodField()

    class Meta:
        model = Proposal
        fields = ('viewed', 'submitter', 'submitter_profile', 'project_details', 'cover_letter', 'equity', 'cash', 'hourly_rate', 'hours', 'status', 'id', 'project', 'create_date', 'message', 'questions_and_answers')

    def get_project_details(self, obj):
        return { 'title': obj.project.title, 'id': obj.project.id }

    def get_submitter_profile(self, obj):
        submitter = { k: getattr(obj.submitter, k) for k in [
            'id', 'first_name', 'capacity', 'city', 'state'
        ]}
        submitter['photo_url'] = obj.submitter.get_photo
        submitter['roles'] =  [role.display_name for role in obj.submitter.roles.all()]
        return submitter

    def get_questions_and_answers(self, obj):
        answers = obj.answers
        serializer = QASerializer(answers, many=True)
        return serializer.data

