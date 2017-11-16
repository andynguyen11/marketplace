from rest_framework import permissions


#TODO subscribed permission hits db every time, refactor later
class IsSubscribed(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.subscribed or request.user.is_superuser