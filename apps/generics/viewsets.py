from rest_framework import viewsets
from rest_framework import generics
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
        kwargs = cast_or_discard_key(kwargs, opt + '_id', opt)
    kwargs = cast_or_discard_key(kwargs, 'pk', 'pk')
    return kwargs


class NestedModelViewSet(viewsets.ModelViewSet):
    ""
    parent_keys = tuple()
    exclude_keys = tuple()

    def exclude(self, kwargs):
        return {
            k: v for k, v in kwargs.items()
            if k not in self.exclude_keys
                and k not in tuple(e+'_id' for e in self.exclude_keys)
                and k not in tuple(e+'_pk' for e in self.exclude_keys)
        }

    def resolve_options(self, options):
        return self.exclude(resolve_options(options, *self.parent_keys))

    def list(self, request, **kwargs):
        data = self.queryset.filter(**self.resolve_options(kwargs))
        serializer = self.serializer_class(data, many=True)
        return Response(serializer.data)

    def retrieve(self, request, **kwargs):
        data = get_object_or_404(self.queryset, **self.resolve_options(kwargs))
        serializer = self.serializer_class(data)
        return Response(serializer.data)

    def create(self, request, **kwargs):
        for k, v in self.resolve_options(kwargs).items():
            request.data[k] = v
        return super(NestedModelViewSet, self).create(request, **kwargs)

