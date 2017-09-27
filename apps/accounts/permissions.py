from rest_framework import permissions

from business.models import Project


#TODO subscribed permission hits db every time, refactor later
class IsSubscribed(permissions.BasePermission):

    def has_permission(self, request, view):
        active_projects = Project.objects.filter(project_manager=request.user, status='active')
        if active_projects:
            return True
        return False