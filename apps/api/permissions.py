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
                    request.data.get('contractor', None) is None
                    or self.user_is_contractor(request)
                ))


class PublicReadProjectOwnerEditPermission(permissions.BasePermission):
    """
    Custom permission for project managers to edit project.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.project_manager.id or (
                request.method in permissions.SAFE_METHODS)


class ProductOrderPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, order):
        return (request.method in permissions.SAFE_METHODS or
                view.action == 'update_status') and (
                request.user in order.involved_users)


class IsSenderReceiver(permissions.BasePermission):
    """
    Custom permission to only allow sender / receiver to update
    """
    def has_object_permission(self, request, view, obj):
        return request.user.id == obj.receiver.id or \
               request.user.id == obj.sender.id