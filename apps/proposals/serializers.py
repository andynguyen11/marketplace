from rest_framework import serializers

from proposals.models import Question, Answer, Proposal


class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = ('id', 'text', 'project')


class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Answer


class ProposalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Proposal
