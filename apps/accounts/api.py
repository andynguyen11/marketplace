from django.http import HttpResponseForbidden, HttpResponseRedirect
from django.contrib.auth import login, authenticate
from django.shortcuts import redirect, get_object_or_404
from django.utils.decorators import method_decorator
from drf_haystack.viewsets import HaystackViewSet
from drf_haystack.filters import HaystackFilter
from notifications.models import Notification
from rest_framework import status, generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.decorators import permission_classes, list_route, detail_route
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from accounts.models import Profile, ContactDetails, Skills, SkillTest, VerificationTest
from accounts.decorators import check_token
from accounts.permissions import IsSubscribed
from accounts.tasks import email_confirmation
from business.models import Project
from accounts.serializers import ProfileSerializer, ContactDetailsSerializer, SkillsSerializer, SkillTestSerializer, VerificationTestSerializer, NotificationSerializer, ProfileSearchSerializer
from apps.api.utils import set_jwt_token
from apps.api.permissions import (
        IsCurrentUser, IsOwnerOrIsStaff, CreateReadOrIsCurrentUser,
        ReadOrIsOwnedByCurrentUser, ReadOnlyOrIsAdminUser, SkillTestPermission )
from expertratings.utils import nicely_serialize_verification_tests
from generics.tasks import validate_confirmation_signature
from generics.viewsets import NestedModelViewSet, assign_crud_permissions
from postman.serializers import ConversationSerializer
from generics.utils import parse_signature
from django.shortcuts import redirect, get_object_or_404


check_token_m = method_decorator(check_token)

class SkillViewSet(ModelViewSet):
    queryset = Skills.objects.filter(protected=True)
    serializer_class = SkillsSerializer

    permission_classes = ( ReadOnlyOrIsAdminUser, )


class VerificationTestViewSet(NestedModelViewSet):
    queryset = VerificationTest.objects.all()
    serializer_class = VerificationTestSerializer
    parent_key = 'skill'

    permission_classes = ( ReadOnlyOrIsAdminUser, )


def cross_pollinate_email(instance, key):
    "set and confirm email on related model if appropriate"
    if instance.email_confirmed:
        related = getattr(instance, key)
        if not related.email:
            related.email = instance.email
        if instance.email == related.email:
            related.email_confirmed = True
            related.save()

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

    @detail_route(methods=['get'])
    def send_confirmation_email(self, request, *args, **kwargs):
        details = self.get_object()
        if not details.email_confirmed:
            email_confirmation(user=details.profile, instance=details)
            return Response(status=201)
        else:
            return Response("Already confirmed", status=409)

    @detail_route(permission_classes=tuple())
    @check_token_m
    def confirm_email(self, request, pk, *args, **kwargs):
        signature = request.query_params.get('signature', None)
        contact_details = ContactDetails.objects.get(profile_id=pk)
        validate_confirmation_signature(contact_details, signature)
        cross_pollinate_email(contact_details, 'profile')
        return HttpResponseRedirect(request.query_params.get('next', '/profile/'))


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = ( CreateReadOrIsCurrentUser, )

    def create(self, request, *args, **kwargs):
        password = request.data.pop('password')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.set_password(password)
        user.save()
        assign_crud_permissions(user, user)
        headers = self.get_success_headers(serializer.data)
        account = authenticate(username=user.email, password=password)
        response = Response(ProfileSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)
        response = set_jwt_token(response, account)
        login(request, account)
        return response

    def update(self, request, *args, **kwargs):
        new_password = request.data.get('password', None)
        email = request.data.get('email', None)
        if (email and request.user.email != email) or new_password:
            try:
                password = request.data.pop('current_password')
                authorized = authenticate(username=request.user.email, password=password)
                if not authorized:
                    return Response(status=403)
            except KeyError:
                return Response(status=403)
        return super(ProfileViewSet, self).update(request, *args, **kwargs)

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
                view['last_name'] = response.data.get('last_name', None)
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

    @detail_route(methods=['get'])
    def send_confirmation_email(self, request, *args, **kwargs):
        user = self.get_object()
        if user != request.user:
            raise PermissionDenied("Users can only request their own confirmation emails")

        if not user.email_confirmed:
            email_confirmation(user=user, template='verify-signup-email')
            return Response(status=201)
        else:
            return Response("Already confirmed", status=409)

    @detail_route(permission_classes=tuple())
    @check_token_m
    def confirm_email(self, request, *args, **kwargs):
        signature = request.query_params.get('signature', None)
        profile = self.get_object() 
        validate_confirmation_signature(profile , signature)
        cross_pollinate_email(profile, 'contact_details')

        if (not profile.long_description): # signup incomplete
            return HttpResponseRedirect(request.query_params.get('next', '/onboard/'))
        elif (not profile.roles): # is entrepreneur
            return HttpResponseRedirect(request.query_params.get('next', '/onboard/'))
        return HttpResponseRedirect(request.query_params.get('next', '/profile/'))

    @detail_route(methods=['POST'], permission_classes=[IsAuthenticated],)
    def invite(self, request, *args, **kwargs):
        # if already invited or new project
        # invite only relevant project
        # expired vs new project
        profile = self.get_object()
        if request.user.subscribed:
            profile.invite(sender=request.user)
            return Response(status=201)
        else:
            return Response(status=403)


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


#TODO Redundant with project search
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12


class ProfileSearchViewSet(HaystackViewSet):
    """
    supports [drf-haystack queries](https://drf-haystack.readthedocs.io/en/latest/01_intro.html#query-time):
    url encoding in general

    * `foo+bar #=> foo AND bar`
    * `foo,bar #=> foo OR bar`

    example search: [?text=python&city=austin&state=texas&country=)

    """
    index_models = [Profile]
    serializer_class = ProfileSearchSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated, IsSubscribed]