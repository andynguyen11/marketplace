from django.http import HttpResponseForbidden
from django.contrib.auth import login, authenticate
from rest_condition import Not
from rest_framework import status, generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import permission_classes, list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from accounts.models import Profile, Skills, SkillTest
from accounts.serializers import ProfileSerializer, SkillsSerializer, SkillTestSerializer
from apps.api.permissions import IsCurrentUser, IsOwnerOrIsStaff
from generics.tasks import account_confirmation
from generics.viewsets import NestedModelViewSet
from django.shortcuts import redirect


class SkillViewSet(ModelViewSet):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer

    @permission_classes((IsAdminUser, ))
    def update(self, request, *args, **kwargs):
        return super(SkillViewSet, self).update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def partial_update(self, request, *args, **kwargs):
        return super(SkillViewSet, self).partial_update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def delete(self, request, *args, **kwargs):
        return super(SkillViewSet, self).delete(request, *args, **kwargs)


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def create(self, request, *args, **kwargs):
        password = request.data.pop('password')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user.username = user.email
        user.set_password(password[0])
        user.save()
        headers = self.get_success_headers(serializer.data)
        account = authenticate(username=user.email, password=password[0])
        login(request, account)
        return Response(ProfileSerializer(user).data, status=status.HTTP_201_CREATED)

    def public_view(self, profile_dict):
        return { k: v for k, v in profile_dict.items() if k in self.serializer_class.Meta.public_fields }

    def list(self, request, *args, **kwargs):
        response = super(ProfileViewSet, self).list(request, *args, **kwargs)
        response.data = map(self.public_view, response.data)
        return response

    def retrieve(self, request, *args, **kwargs):
        response = super(ProfileViewSet, self).retrieve(request, *args, **kwargs)
        if response.data['id'] != self.request.user.id:
            response.data = self.public_view(response.data)
        return response

    @permission_classes((IsAuthenticated, IsCurrentUser ))
    def update(self, request, *args, **kwargs):
        if request.data.get('signup', None):
            account_confirmation.delay(
                request.user.id,
                request.data.get('role', None)
            )
        return super(ProfileViewSet, self).update(request, *args, **kwargs)

    @permission_classes((IsAuthenticated, IsCurrentUser ))
    def partial_update(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).partial_update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def destroy(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).destroy(request, *args, **kwargs)


class SkillTestViewSet(NestedModelViewSet):
    queryset = SkillTest.objects.all()
    serializer_class = SkillTestSerializer
    permission_classes = (IsAuthenticated, IsOwnerOrIsStaff)
    parent_key = 'profile'

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

    @list_route(methods=['get'], permission_classes=(IsAdminUser, IsOwnerOrIsStaff))
    def testfor(self, request, *args, **kwargs):
        skill_id = request.query_params.get('skill', None)
        verification_test = Skills.objects.get(id=skill_id).verification_test
        if verification_test is None:
            msg = '<Skills id=%s> does not have a verification test assigned' % skill_id
            raise SkillTest.DoesNotExist(msg)
        else:
            request.data._mutable = True
            request.data['expertratings_test'] = verification_test.test_id
            create_response = self.create(request, *args, **kwargs)
            return redirect(create_response.data['ticket_url'])
