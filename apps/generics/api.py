from generics.serializers import AttachmentSerializer
from django.contrib.contenttypes.models import ContentType
from generics.models import Attachment
from rest_framework import viewsets, authentication, permissions
from rest_framework.permissions import IsAuthenticated

from guardian.shortcuts import get_perms

class ContentObjectPermission(permissions.BasePermission):
    """ User owns related object"""

    def has_object_permission(self, request, view, obj):
        perm = 'change_%s' % obj.content_object._meta.model_name 
        return perm in get_perms(request.user, obj.content_object)

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = (IsAuthenticated, ContentObjectPermission)

