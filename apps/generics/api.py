from generics.serializers import AttachmentSerializer
from django.contrib.contenttypes.models import ContentType
from generics.models import Attachment
from rest_framework import viewsets, authentication, permissions
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, DjangoObjectPermissions


class OwnerPermission(permissions.BasePermission):
    """ User owns attachmnet"""

    def has_object_permission(self, request, view, obj):
        return True #request.user.id == obj.content_object

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = (IsAuthenticated, OwnerPermission)

