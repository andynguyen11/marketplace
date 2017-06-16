from rest_framework import permissions

from proposals.models import Proposal


class InvoicePermissions(permissions.BasePermission):

    def can_view(self, request, obj):
        return (request.method in permissions.SAFE_METHODS) and \
               (request.user.id == obj.recipient.id or request.user.id == obj.sender.id)

    def can_update(self, request, obj):
        return (request.method == 'PATCH') and \
               (request.user.id == obj.sender.id)

    def is_valid_recipient(self, request):
        proposals = Proposal.objects.filter(submitter=request.user, status='responded')
        return [proposal.project.project_manager.id for proposal in proposals]

    def has_permission(self, request, view, **kwargs):
        recipient = request.data.get('recipient', None)
        if recipient and recipient not in self.is_valid_recipient(request):
            return False
        return True

    def has_object_permission(self, request, view, obj):
        return self.can_view(request, obj) or self.can_update(request, obj)