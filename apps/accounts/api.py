from django.http import HttpResponseForbidden
from django.contrib.auth import login, authenticate
from rest_condition import Not
from rest_framework import status, generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import permission_classes, list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from accounts.models import Profile, Skills, SkillTest, VerificationTest
from accounts.serializers import ProfileSerializer, SkillsSerializer, SkillTestSerializer, VerificationTestSerializer
from apps.api.permissions import (
        IsCurrentUser, IsOwnerOrIsStaff, CreateReadOrIsCurrentUser,
        ReadOrIsOwnedByCurrentUser, ReadOnlyOrIsAdminUser, SkillTestPermission )
from expertratings.utils import nicely_serialize_verification_tests
from generics.tasks import account_confirmation
from generics.viewsets import NestedModelViewSet, assign_crud_permissions
from django.shortcuts import redirect


class SkillViewSet(ModelViewSet):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer

    permission_classes = ( ReadOnlyOrIsAdminUser, )


class VerificationTestViewSet(NestedModelViewSet):
    queryset = VerificationTest.objects.all()
    serializer_class = VerificationTestSerializer
    parent_key = 'skill'

    permission_classes = ( ReadOnlyOrIsAdminUser, )


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
        login(request, account)
        return Response(ProfileSerializer(user).data, status=status.HTTP_201_CREATED)

    def public_view(self, profile_dict):
        return { k: v for k, v in profile_dict.items() if k in self.serializer_class.Meta.public_fields }

    def list(self, request, *args, **kwargs): # TODO: This is really slow
        response = super(ProfileViewSet, self).list(request, *args, **kwargs)
        response.data = map(self.public_view, response.data)
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(ProfileViewSet, self).retrieve(request, *args, **kwargs)
        if response.data['id'] != self.request.user.id:
            response.data = self.public_view(response.data)
        return response

    def update(self, request, *args, **kwargs):
        if request.data.get('signup', None):
            account_confirmation.delay(
                request.user.id,
                request.data.get('role', None)
            )
        return super(ProfileViewSet, self).update(request, *args, **kwargs)

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

    def create(self,  request, *args, **kwargs):
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

