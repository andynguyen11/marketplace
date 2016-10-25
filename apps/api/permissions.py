from rest_framework import permissions
from business.models import Job


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
        return obj.profile == request.user


class IsOwnerOrIsStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners or staff to CRUD
    """

    def has_object_permission(self, request, view, obj):
        is_owner = request.user.id == request.data['user']
        is_staff = request.user.is_staff()
        return is_owner or is_staff


class ReadOnlyOrIsAdminUser(permissions.BasePermission):
    """ allow SAFE_METHODS, admin actions, and specified unauthenticated writes"""

    allowed_unauthenticated_writes = []
    allowed_authenticated_writes = []

    def is_safe(self, request):
        return (request.method in permissions.SAFE_METHODS)

    def allowed_write(self, request, view):
        return view.action in self.allowed_unauthenticated_writes or \
            request.user.is_authenticated() and view.action in self.allowed_authenticated_writes

    def permitted(self, request, view):
        return self.is_safe(request) or self.allowed_write(request, view) or request.user.is_staff

    def has_permission(self, request, view):
        if self.permitted(request, view):
            return True
        else:
            try:
                obj = view.get_object()
                return self.has_object_permission(request, view, obj)
            except AssertionError, e:
                return False

    def has_object_permission(self, request, view, obj):
        return self.permitted(request, view)


class CreateReadOrIsCurrentUser(ReadOnlyOrIsAdminUser):
    allowed_unauthenticated_writes = [ 'create' ]
    def has_object_permission(self, request, view, obj):
        return self.permitted(request, view) or request.user == obj or request.user.is_staff

class AuthedCreateRead(ReadOnlyOrIsAdminUser):
    allowed_authenticated_writes = [ 'create' ]

class ReadOrIsOwnedByCurrentUser(ReadOnlyOrIsAdminUser):
    def has_object_permission(self, request, view, obj):
        return self.permitted(request, view) or request.user == obj.profile or request.user.is_staff

class SkillTestPermission(ReadOrIsOwnedByCurrentUser):
    def has_permission(self, request, view):
        return super(SkillTestPermission, self).has_permission(request, view) and (
            view.action != 'take' or request.user == view.parent or request.user.is_staff )


class BidPermission(permissions.BasePermission):
    """
    Custom permission for project managers and developers to edit job.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.contractor.id or \
               request.user.id == obj.project.project_manager.id


class ContractorBidPermission(permissions.BasePermission):
    """
    Custom permission for project managers and developers to edit job.
    """
    def can_view(self, request, obj):
        return (request.method in permissions.SAFE_METHODS) and (
                request.user.id == obj.contractor.id or \
                request.user.id == obj.project.project_manager.id)

    def user_is_contractor(self, request):
        return request.user.id == request.data.get('contractor', None)

    def has_permission(self, request, view, **kwargs):
        return view.action not in ['create'] or self.user_is_contractor(request)

    def has_object_permission(self, request, view, obj):
        return self.can_view(request, obj) or (
                request.user.id == obj.contractor.id and (
                    request.data.get('contractor', None) is None or self.user_is_contractor(request)
                ))


class ContracteeTermsPermission(permissions.BasePermission):
    """
    Custom permission for project managers and developers to edit job.
    """
    def can_view(self, request, obj):
        return (request.method in permissions.SAFE_METHODS) and (
                request.user.id == obj.contractor.id or \
                request.user.id == obj.project.project_manager.id)

    def get_project_manager(self, request):
        return Job.objects.get(id=request.data.get('job', None)).project.project_manager
    def user_is_contractee(self, request):
        try:
            return request.user.id == self.get_project_manager(request)
        except Job.DoesNotExist, e:
            return False

    def has_permission(self, request, view, **kwargs):
        return (request.method in permissions.SAFE_METHODS) or self.user_is_contractee(request)

    def has_object_permission(self, request, view, obj):
        return self.can_view(request, obj.job) or (
                request.user.id == obj.job.project.project_manager)


class IsJobOwnerPermission(permissions.BasePermission):
    def has_permission(self, request, view, **kwargs):
        return view.action not in ['create'] or request.user.id == view.parent.owner.id


class IsProjectOwnerPermission(permissions.BasePermission):
    """
    Custom permission for project managers to edit project.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.project_manager.id


