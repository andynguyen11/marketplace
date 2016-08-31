from rest_framework import permissions

class IsPartOfConversation(permissions.BasePermission):
    """
    Custom permission to only allow people in conversation
    """
    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.recipient.id or request.user.id == obj.sender.id or request.user.is_staff