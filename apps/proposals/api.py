from datetime import datetime, timedelta

from rest_framework import generics, viewsets
from rest_framework.decorators import detail_route
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from business.models import NDA, Project
from generics.tasks import new_message_notification
from generics.utils import send_mail
from postman.models import Message, Interaction
from proposals.models import Question, Proposal
from proposals.permissions import ProposalPermission
from proposals.serializers import QuestionSerializer, ProposalSerializer, AnswerSerializer, RedactedProposalSerializer
from proposals.tasks import proposal_reminder

def add_ordering(questions):
    if not isinstance(questions, list):
        questions['ordering'] = 0
        return questions
    for index, question in enumerate(questions):
        question['ordering'] = index
    return questions

def is_update(user, current_question, question):
    return (current_question.text != question['text'] and
            current_question.project.id == question['project'] and
            current_question.project.project_manager == user )

def apply_update(current_question, question, order):
    current_question.text = question['text']
    current_question.order = order
    updated_question = current_question.save()
    return updated_question

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
            return Response(status=200, data=[])
        project = list(set(question['project'] for question in request.data))
        if len(project) != 1:
            return Response(status=403)
        project_id = project[0]
        project = Project.objects.get(id=project_id)
        current_ids = [question.id for question in Question.objects.filter(project=project_id, active=True)]
        updated_ids = []
        for order, question in enumerate(request.data):
            try:
                current_question = Question.objects.get(id=question['id'])
                if is_update(request.user, current_question, question):
                    updated_question = apply_update(current_question, question, order)
                updated_ids.append(question['id'])
            except KeyError:
                if question['text']:
                    question_data = {
                        'text': question['text'],
                        'project': project,
                        'ordering': order,
                        'active': True
                    }
                    new_question = Question.objects.create(**question_data)
                    updated_ids.append(new_question.id)
        inactive_ids = [id for id in current_ids if id not in updated_ids]
        for id in inactive_ids:
            inactive_question = Question.objects.get(id=id)
            inactive_question.active = False
            inactive_question.save()
        questions = Question.objects.filter(project=project_id, active=True).order_by('ordering')
        serializer = self.get_serializer(data=questions, many=True)
        serializer.is_valid(raise_exception=False)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=200, headers=headers)


class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = (IsAuthenticated, ProposalPermission, )

    def retrieve(self, request, *args, **kwargs):
        proposal = self.get_object()
        serializer = self.get_serializer(proposal)
        if self.request.user == proposal.project.project_manager and proposal.project.sku == 'free':
            serializer = RedactedProposalSerializer(proposal)
        return Response(serializer.data)

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
        today = datetime.utcnow()
        proposal_reminder.apply_async((request.data['project'], ), eta=today + timedelta(days=2))
        proposals = Proposal.objects.filter(submitter=request.user)
        if not proposals and not request.user.stripe_connect:
            send_mail('add-payment', [request.user], {'fname': request.user.first_name})
        elif proposals.count() == 3 and not request.user.stripe_connect:
            send_mail('add-payment-reminder', [request.user], {'fname': request.user.first_name})
        return super(ProposalViewSet, self).create(request, *args, **kwargs)

    @detail_route(methods=['POST'])
    def respond(self, request, *args, **kwargs):
        proposal = self.get_object()
        if proposal.status == 'pending' and proposal.recipient == request.user and proposal.project.sku != 'free':
            conversation = Message.objects.create(
                sender = proposal.recipient,
                recipient = proposal.submitter,
                subject = proposal.project.title,
                body = '',
            )
            conversation.thread = conversation
            conversation.save()
            proposal.message = conversation
            proposal.status = 'responded'
            proposal.save()
            nda, created = NDA.objects.get_or_create(
                sender=proposal.recipient,
                receiver=proposal.submitter,
                proposal=proposal
            )
            serializer = self.get_serializer(data=proposal)
            serializer.is_valid(raise_exception=False)
            return Response({'message': conversation.id}, status=200)
        return Response(status=403)
