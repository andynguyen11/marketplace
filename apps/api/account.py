from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.http import HttpResponseForbidden

from api.serializers import ProfileSerializer
from accounts.models import Profile


class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    renderer_classes = (JSONRenderer, )
    permission_classes = (IsAuthenticated, )