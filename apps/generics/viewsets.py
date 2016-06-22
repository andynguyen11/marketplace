from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

def cast_or_discard_key(d, key, dest_key):
    arg = d.pop(key, None)
    try:
        arg = int(arg)
        d[dest_key] = arg
    except (ValueError, TypeError), e:
        pass
    return d

def resolve_options(kwargs, *optional_refs):
    for opt in optional_refs:
        kwargs = cast_or_discard_key(kwargs, opt + '_pk', opt)
    kwargs = cast_or_discard_key(kwargs, 'pk', 'pk')
    return kwargs


class NestedModelViewSet(viewsets.ModelViewSet):
    ""
    parent_keys = tuple()

    def resolve_options(self, options):
        return resolve_options(options, *self.parent_keys)

    def list(self, request, **kwargs):
        data = self.queryset.filter(**self.resolve_options(kwargs))
        serializer = self.serializer_class(data, many=True)
        return Response(serializer.data)

    def retrieve(self, request, **kwargs):
        data = get_object_or_404(self.queryset, **self.resolve_options(kwargs))
        serializer = self.serializer_class(data)
        return Response(serializer.data)

