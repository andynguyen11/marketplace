from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to read/edit it.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsOwnerOrIsStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners or staff to CRUD
    """

    def has_object_permission(self, request, view, obj):
        is_owner = request.user.id == request.data['user']
        is_staff = request.user.is_staff()
        return is_owner or is_staff