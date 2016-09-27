from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import re
from generics.utils import normalize_key_suffixes as normalize
from guardian.shortcuts import assign_perm, get_perms

class ObjectPermissions(permissions.BasePermission):
    method_map = {
            'DELETE': 'delete',
            'PUT': 'change',
            'PATCH': 'change' }
    def has_object_permission(self, request, view, obj):
        action = self.method_map.get(request.method, 'change')
        for perm in get_perms(request.user, obj):
            if perm.split('_')[0] == action:
                return True

def assign_crud_permissions(user, object):
    model_name = object._meta.model_name
    for permission in ['change', 'delete']:
        assign_perm('%s_%s' % (permission, model_name), user, object)

class CreatorPermissionsMixin(object):

    permission_classes = (ObjectPermissions, )

    def perform_create(self, serializer):
        object = serializer.save()
        assign_crud_permissions(self.request.user, object)


class NestedModelViewSet(viewsets.ModelViewSet):
    ""
    parent_key = None
    _parent = None

    @property
    def keys(self):
        kwargs = {self.parent_key: normalize(self.kwargs)[self.parent_key]}
        id = self.kwargs.get('id', self.kwargs.get('pk', None))
        if id: kwargs['id'] = id
        return kwargs

    @property
    def parent_kwargs(self):
        kwargs = normalize(self.kwargs)
        kwargs.pop('pk', kwargs.pop('id', None)) 
        kwargs['id'] = kwargs.pop(self.parent_key)
        return kwargs

    @property
    def parent(self):
        if not self._parent:
             self._parent = getattr(self.serializer_class.Meta.model, self.parent_key).field.related_model.objects.get(**self.parent_kwargs)
        return self._parent

    @property
    def list_data(self):
        data = self.queryset.filter(**self.keys)
        return self.serializer_class(data, many=True).data

    def list(self, request, **kwargs):
        return Response(self.list_data)

    def retrieve(self, request, **kwargs):
        data = get_object_or_404(self.queryset, **self.keys)
        serializer = self.serializer_class(data)
        return Response(serializer.data)

    def create(self, request, **kwargs):
        request.data[self.parent_key] = self.parent_kwargs['id']
        return super(NestedModelViewSet, self).create(request, **kwargs)

    def update(self, request, **kwargs):
        request.data[self.parent_key] = self.parent_kwargs['id']
        return super(NestedModelViewSet, self).update(request, **kwargs)
