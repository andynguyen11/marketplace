from rest_framework import permissions


class IsCurrentUser(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to read/edit it.
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user


class IsPrimary(permissions.BasePermission):
    """
    Permission to make sure if user is primary to edit company
    """
    def has_object_permission(self, request, view, obj):
        return obj.primary_contact.profile == request.user


class IsProfile(permissions.BasePermission):
    """
    Permission to make sure if user is primary to edit company
    """
    def has_object_permission(self, request, view, obj):
        print(obj.profile)
        return obj.profile == request.user


class IsOwnerOrIsStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners or staff to CRUD
    """

    def has_object_permission(self, request, view, obj):
        is_owner = request.user.id == request.data['user']
        is_staff = request.user.is_staff()
        return is_owner or is_staff


class BidPermission(permissions.BasePermission):
    """
    Custom permission for project managers and developers to edit job.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.contractor.id or \
               request.user.id == obj.project.project_manager.id


class IsJobOwnerPermission(permissions.BasePermission):
    def has_permission(self, request, view, **kwargs):
        return view.action not in ['create'] or request.user.id == view.parent.owner.id


class IsProjectOwnerPermission(permissions.BasePermission):
    """
    Custom permission for project managers to edit project.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.project_manager.id


