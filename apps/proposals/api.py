from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from proposals.models import Question, Proposal
from proposals.serializers import QuestionSerializer, ProposalSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Create questions
    Patch will mark changed question as inactive and create change as a new question for project
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = (IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=isinstance(request.data,list))
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    def update(self, request, *args, **kwargs):
        new_questions = []
        project = list(set(question['project'] for question in request.data))
        if len(project) != 1:
            return Response(status=403)
        project_id = project[0]
        for question in request.data:
            old_question = Question.objects.get(id=question['id'])
            if old_question.text != question['text'] and old_question.project.id == question['project'] and old_question.project.project_manager == request.user:
                old_question.active = False
                old_question.save()
                if question['text']:
                    new_question = {
                        'text': question['text'],
                        'project': question['project']
                    }
                    question['text'] = old_question.text
                    new_questions.append(new_question)
        if new_questions:
            create_serializer = self.get_serializer(data=new_questions, many=isinstance(new_questions,list))
            create_serializer.is_valid(raise_exception=True)
            self.perform_create(create_serializer)
        questions = Question.objects.filter(project=project_id, active=True)
        serializer = self.get_serializer(data=questions, many=True)
        serializer.is_valid(raise_exception=False)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=200, headers=headers)


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = (IsAuthenticated, )

    def create(self, request, *args, **kwargs):
        answers = request.data.pop('answers')
        answer_serializer = AnswerSerializer(data=answers, many=True)
        answer_serializer.is_valid(raise_exception=True)
        self.perform_create(answer_serializer)
        return super(ProposalViewSet, self).create(request, *args, **kwargs)