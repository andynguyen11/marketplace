from rest_framework import permissions

class ProposalPermission(permissions.BasePermission):
    def can_view(self, request, obj):
        return (request.method in permissions.SAFE_METHODS) and \
               (request.user.id == obj.recipient.id or request.user.id == obj.submitter.id)

    def can_patch(self, request, obj):
        if request.user == obj.recipient:
            payload = None
            if 'status' in request.data:
                payload = request.data.get('status', None)
            if 'viewed' in request.data:
                payload = request.data.get('viewed', None)
            return len(request.data) == 1 and payload
        else:
            return request.user == obj.submitter

    def can_post(self, request, obj):
        payload = None
        if 'proposal' in request.data and request.user == obj.recipient:
            payload = request.data.get('proposal', None)
        return len(request.data) == 1 and payload

    def has_object_permission(self, request, view, obj):
        return self.can_view(request, obj) \
               or self.can_patch(request, obj) \
               or self.can_post(request, obj) \
               or (request.user == obj.submitter)