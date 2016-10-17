from generics.serializers import AttachmentSerializer, retrieve_content_object
from django.contrib.contenttypes.models import ContentType
from generics.models import Attachment
from rest_framework import viewsets, authentication, permissions
from rest_framework.permissions import IsAuthenticated

from guardian.shortcuts import get_perms

class ContentObjectPermission(permissions.BasePermission):
    """ User owns related object """

    def content_object_permission(self, request, content_object):
        perm = 'change_%s' % content_object._meta.model_name 
        return perm in get_perms(request.user, content_object)

    def can_write(self, request):
        content_object = retrieve_content_object(request.data.dict()).get('content_object', None)
        return content_object and self.content_object_permission(request, content_object)

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or self.can_write(request)

    def has_object_permission(self, request, view, obj):
        return self.content_object_permission(request, obj.content_object)

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = (IsAuthenticated, ContentObjectPermission)

