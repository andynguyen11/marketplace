from django.http import HttpResponseForbidden
from rest_condition import Not
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import permission_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics

from accounts.models import Profile, Skills, SkillTest
from accounts.serializers import ProfileSerializer, SkillsSerializer, SkillTestSerializer
from apps.api.permissions import IsCurrentUser
from generics.viewsets import NestedModelViewSet


class SkillsList(generics.ListAPIView):
    queryset = Skills.objects.all()
    serializer_class = SkillsSerializer
    renderer_classes = (JSONRenderer, )


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    @permission_classes((IsAuthenticated, IsCurrentUser ))
    def update(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).update(request, *args, **kwargs)

    @permission_classes((IsAuthenticated, IsCurrentUser ))
    def partial_update(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).partial_update(request, *args, **kwargs)

    @permission_classes((IsAdminUser, ))
    def destroy(self, request, *args, **kwargs):
        return super(ProfileViewSet, self).destroy(request, *args, **kwargs)

    def get_object(self):
        return self.request.user


class SkillTestViewSet(NestedModelViewSet):
    queryset = SkillTest.objects.all()
    serializer_class = SkillTestSerializer
    permission_classes = (IsAuthenticated, )
    parent_keys = ('profile',)

    def new_ticket(self, request):
        instance = SkillTest.objects.get(profile=request.data['profile'], expertratings_test=request.data['expertratings_test'])
        serializer = SkillTestSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return serializer.data

    def create(self,  request, *args, **kwargs):
        try:
            return super(SkillTestViewSet, self).create(request, *args, **kwargs)
        except ValidationError, e:
            return Response(self.new_ticket(request))
            #return super(SkillTestViewSet, self).update(request, *args, **kwargs)

