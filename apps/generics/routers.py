import tagulous

from django.conf.urls import patterns, url
from rest_framework_nested import routers

class DeclarativeRouter(object):

    def handle_args(self, route):
        if type(route) == dict:
            view = route.pop('view', route.pop('viewset', None))
            return view, route
        else: return route, {}

    def handle_nested_args(self, nested):
        if nested.has_key('routes'):
            return nested.pop('routes'), nested
        else: return nested, {}

    def register_nested_router(self, parent_router, parent_key, router_args):
        nested, kwargs = self.handle_nested_args(router_args)
        router = routers.NestedSimpleRouter(parent_router, parent_key, **kwargs)
        self.subrouters.append(router)
        for key, value in nested.items():
            self.register_router(router, name=key, router_args=value)

    def register_router(self, router, name, router_args):
        view, kwargs = self.handle_args(router_args)
        nested = kwargs.pop('nested', None)
        router.register(name, view, **kwargs)
        if nested:
            self.register_nested_router(router, name, nested)

    def __init__(self, router_dict):
        self.router = routers.SimpleRouter()
        self.subrouters = [] 
        for key, value in router_dict.items():
            self.register_router(router=self.router, name=key, router_args=value)

    @property
    def urls(self):
        all_urls = self.router.urls 
        for subrouter in self.subrouters:
            all_urls.extend(subrouter.urls)
        return all_urls
