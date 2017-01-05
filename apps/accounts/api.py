from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.contrib.auth import login, authenticate
from django.shortcuts import redirect, get_object_or_404
from notifications.models import Notification
from rest_condition import Not
from rest_framework import status, generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.decorators import permission_classes, list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from accounts.models import Profile, ContactDetails, Skills, SkillTest, VerificationTest
from business.models import Job, Project
from payment.models import ProductOrder
from accounts.serializers import ProfileSerializer, ContactDetailsSerializer, SkillsSerializer, SkillTestSerializer, VerificationTestSerializer, NotificationSerializer
from apps.api.utils import set_jwt_token
from apps.api.permissions import (
        IsCurrentUser, IsOwnerOrIsStaff, CreateReadOrIsCurrentUser,
        ReadOrIsOwnedByCurrentUser, ReadOnlyOrIsAdminUser, SkillTestPermission )
from expertratings.utils import nicely_serialize_verification_tests
from generics.tasks import account_confirmation, email_confirmation, validate_confirmation_signature
from generics.viewsets import NestedModelViewSet, assign_crud_permissions
from postman.serializers import ConversationSerializer
from generics.utils import parse_signature
from django.shortcuts import redirect, get_object_or_404


class SkillViewSet(ModelViewSet):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer

    permission_classes = ( ReadOnlyOrIsAdminUser, )


class VerificationTestViewSet(NestedModelViewSet):
    queryset = VerificationTest.objects.all()
    serializer_class = VerificationTestSerializer
    parent_key = 'skill'

    permission_classes = ( ReadOnlyOrIsAdminUser, )


class ContactDetailsViewSet(ModelViewSet):
    serializer_class = ContactDetailsSerializer
    permission_classes = ( IsAuthenticated, )

    def get_queryset(self):
        return ContactDetails.objects.filter(profile=self.request.user)

    def get_object(self):
        return get_object_or_404(self.get_queryset()) 

    def list(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return Response(ContactDetailsSerializer(self.get_object()).data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        if len(self.get_queryset()):
            return self.update(request, *args, **kwargs)
        request.data['profile'] = request.user.id
        return super(ContactDetailsViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        request.data['profile'] = request.user.id
        return super(ContactDetailsViewSet, self).update(request, *args, **kwargs)

    def update_orders_for_user(self, contact_details, role):
        if role == 'freelancer':
            related_ids = [j.id for j in Job.objects.filter(status='pending', contractor_id=contact_details.id)]
        else:
            project_ids = [p.id for p in Project.objects.filter(project_manager_id=contact_details.id)]
            related_ids = [j.id for j in Job.objects.filter(status='pending', project_id__in=project_ids)]
        orders = ProductOrder.objects.filter(
                _product='connect_job',
                request_status='%s_is_validating' % role,
                related_object_id__in=related_ids)
        for order in orders:
            new_status = 'requested_by_%s' % role if order.requester == contact_details.profile else 'accepted'
            order.change_status(new_status, contact_details.profile)

    @detail_route(methods=['get'])
    def send_confirmation_email(self, request, *args, **kwargs):
        details = self.get_object()
        if not details.email_confirmed:
            email_confirmation(user=details.profile, instance=details)
            return Response(status=201)
        else:
            return Response("Already confirmed", status=409)

    @detail_route(permission_classes=tuple())
    def confirm_email(self, request, pk, *args, **kwargs):
        signature = request.query_params.get('signature', None)
        contact_details = ContactDetails.objects.get(profile_id=pk)
        validate_confirmation_signature(contact_details, signature)
        if contact_details.email_confirmed:
            self.update_orders_for_user(contact_details, 'freelancer')
            self.update_orders_for_user(contact_details, 'entrepreneur')
            if contact_details.profile.email == contact_details.email:
                contact_details.profile.email_confirmed = True
                contact_details.profile.save()
        return HttpResponseRedirect(request.query_params.get('next', '/confirmed/'))


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = ( CreateReadOrIsCurrentUser, )

    def create(self, request, *args, **kwargs):
        password = request.data.pop('password')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.username = user.email
        user.set_password(password[0])
        user.save()
        assign_crud_permissions(user, user)
        headers = self.get_success_headers(serializer.data)
        account = authenticate(username=user.email, password=password[0])
        response = Response(ProfileSerializer(user).data, status=status.HTTP_201_CREATED)
        response = set_jwt_token(response, account)
        login(request, account)
        return response

    def public_view(self, profile_dict):
        return { k: v for k, v in profile_dict.items() if k in self.serializer_class.Meta.public_fields }

    def list(self, request, *args, **kwargs): # TODO: This is really slow
        response = super(ProfileViewSet, self).list(request, *args, **kwargs)
        response.data = map(self.public_view, response.data)
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(ProfileViewSet, self).retrieve(request, *args, **kwargs)
        if response.data['id'] != self.request.user.id:
            view = self.public_view(response.data)
            if hasattr(self.request.user, 'connections') and len(self.request.user.connections.filter(id=view['id'])):
                view['contact_details'] = response.data.get('contact_details', None)
            response.data = view
        return response

    @detail_route(methods=['get'])
    def skillsummary(self, request, *args, **kwargs):
        user = request.user
        summary = {
            key: nicely_serialize_verification_tests(values, user)
            for key, values in {
                'testsTaken': VerificationTest.objects.taken(user),
                'testsRecommended': VerificationTest.objects.recommended(user),
                'testsNotTaken': VerificationTest.objects.not_taken(user)
            }.items() }
        for st in summary['testsTaken']:
            for t in st.get('tests', []):
                if not t.has_key('results'):
                    t['results'] = [{'result': 'INPROGRESS'}]
        return Response(summary)

    @list_route(methods=['get'], url_path="connections")
    def connections(self, request, *args, **kwargs):
        user = request.user
        connections = ProfileSerializer(user.connections, many=True).data
        fields = [ 'id', 'first_name', 'last_name', 'photo_url', 'role', 'city', 'state', 'country', 'contact_details' ]
        return Response([
            { k: v for k, v in connection.items() if k in fields }
            for connection in connections ])

    @detail_route(methods=['get'], url_path="connections")
    def _connections(self, request, *args, **kwargs):
        return self.connections(request, *args, **kwargs)

    @detail_route(methods=['get'])
    def send_confirmation_email(self, request, *args, **kwargs):
        user = self.get_object()
        if user != request.user:
            raise PermissionDenied("Users can only request their own confirmation emails")

        if not user.email_confirmed:
            email_confirmation(user=user)
            return Response(status=201)
        else:
            return Response("Already confirmed", status=409)

    @detail_route(permission_classes=tuple())
    def confirm_email(self, request, *args, **kwargs):
        signature = request.query_params.get('signature', None)
        profile = self.get_object() 
        validate_confirmation_signature(profile , signature)
        if profile.email == profile.contact_details.email:
            profile.contact_details.email_confirmed = True
            profile.contact_details.save()
        return HttpResponseRedirect(request.query_params.get('next', '/confirmed/'))

class SkillTestViewSet(NestedModelViewSet):
    queryset = SkillTest.objects.all()
    serializer_class = SkillTestSerializer
    parent_key = 'profile'
    permission_classes = ( SkillTestPermission, )

    def new_ticket(self, request):
        instance = SkillTest.objects.get(profile=Profile.objects.get(id=request.data['profile']), expertratings_test=request.data['expertratings_test'])
        serializer = SkillTestSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return serializer.data

    def create(self, request, *args, **kwargs):
        try:
            return super(SkillTestViewSet, self).create(request, *args, **kwargs)
        except ValidationError, e: # just need a new ticket in expertratings
            #raise e
            return Response(self.new_ticket(request))

    @list_route(methods=['get'])
    def take(self, request, *args, **kwargs):
        request.data._mutable = True
        request.data['expertratings_test'] = str(request.query_params.get('expertratings_test', None))
        create_response = self.create(request, *args, **kwargs)
        return redirect(create_response.data['ticket_url'])


class NotificationUpdate(generics.UpdateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = ( IsAuthenticated, )

    def patch(self, request, pk, *args, **kwargs):
        # TODO, this assumes that notifications will always be marked unread from a message thread.
        # Need to refactor to mark as unread anywhere and update the permissions.
        notification = Notification.objects.get(id = pk)
        if request.user == notification.recipient:
            self.partial_update(request, *args, **kwargs)
            serializer = ConversationSerializer(notification.action_object, context={'request': request})
            return Response(serializer.data)
        else:
            return Response(status=403)
