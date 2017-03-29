from rest_framework import generics, viewsets
from rest_framework.decorators import detail_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from business.models import Job
from generics.tasks import new_message_notification
from postman.models import Message
from proposals.models import Question, Proposal
from proposals.permissions import ProposalPermission
from proposals.serializers import QuestionSerializer, ProposalSerializer, AnswerSerializer

def add_ordering(questions):
    if not isinstance(questions, list):
        questions['ordering'] = 0
        return questions
    for index, question in enumerate(questions):
        question['ordering'] = index
    return questions

def is_update(user, old_question, question):
    return (old_question.text != question['text'] and 
            old_question.project.id == question['project'] and 
            old_question.project.project_manager == user )

def apply_update(old_question, question, order):
    old_question.active = False
    old_question.save()
    if question['text']:
        new_question = {
                'text': question['text'],
                'project': question['project'],
                'ordering': order
        }
        return new_question
    return None

class QuestionViewSet(viewsets.ModelViewSet):
    """
    Create questions
    Patch will mark changed question as inactive and create change as a new question for project
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = (IsAuthenticated, )

    def update(self, request, *args, **kwargs):
        if not request.data:
            return Response(status=200)
        new_questions = []
        project = list(set(question['project'] for question in request.data))
        if len(project) != 1:
            return Response(status=403)
        project_id = project[0]
        for order, question in enumerate(request.data):
            # TODO I think it might be better to key off of active=True && ordering=index, instead of having always changing id
            try:
                old_question = Question.objects.get(id=question['id'])
                if is_update(request.user, old_question, question):
                    new_question = apply_update(old_question, question, order)
                    if new_question:
                        new_questions.append(new_question)
            except KeyError:
                if question['text']:
                    new_question = {
                        'text': question['text'],
                        'project': question['project'],
                        'ordering': order,
                        'active': True
                    }
                    new_questions.append(new_question)
        if new_questions:
            create_serializer = self.get_serializer(data=new_questions, many=isinstance(new_questions,list))
            create_serializer.is_valid(raise_exception=True)
            self.perform_create(create_serializer)
        questions = Question.objects.filter(project=project_id, active=True).order_by('ordering')
        serializer = self.get_serializer(data=questions, many=True)
        serializer.is_valid(raise_exception=False)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=200, headers=headers)


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = (IsAuthenticated, ProposalPermission, )

    def list(self, request, *args, **kwargs):
        queryset = Proposal.objects.filter(submitter=self.request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        if request.data.get('answers', None):
            answers = request.data.pop('answers')
            for answer in answers:
                answer['answerer'] = request.user.id
            answer_serializer = AnswerSerializer(data=answers, many=True)
            answer_serializer.is_valid(raise_exception=False)
            self.perform_create(answer_serializer)
        request.data['submitter'] = request.user.id
        return super(ProposalViewSet, self).create(request, *args, **kwargs)

    @detail_route(methods=['POST'])
    def respond(self, request, *args, **kwargs):
        proposal = self.get_object()
        if proposal.status == 'pending' and proposal.recipient == request.user:
            # Deprecate
            bid, created = Job.objects.get_or_create(
                contractor = proposal.submitter,
                project = proposal.project
            )
            conversation = Message.objects.create(
                sender = proposal.recipient,
                recipient = proposal.submitter,
                subject = proposal.project.title,
                body = request.data['message'],
                job = bid
            )
            conversation.thread = conversation
            conversation.save()
            proposal.message = conversation
            proposal.status = 'responded'
            proposal.save()
            serializer = self.get_serializer(data=proposal)
            serializer.is_valid(raise_exception=False)
            new_message_notification.delay(proposal.submitter.id, conversation.id)
            return Response({'status': 'responded'}, status=200)
        return Response(status=403)
