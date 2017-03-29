from rest_framework import permissions

class ProposalPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if view.action == 'retrieve':
            return obj.submitter == request.user or obj.project.project_manager == request.user
        else:
            return view.action not in ['update', 'partial_update'] or obj.project.project_manager == request.user