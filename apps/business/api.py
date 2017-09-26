import re
import simplejson as json

from django.conf import settings
from django.http import HttpResponseForbidden, Http404, HttpResponse
from drf_haystack.viewsets import HaystackViewSet
from drf_haystack.filters import HaystackFilter
from haystack.query import SearchQuerySet
from rest_framework import generics, viewsets, authentication, permissions, status
from rest_framework.filters import OrderingFilter
from rest_framework.views import APIView
from rest_framework.decorators import detail_route, list_route, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, DjangoObjectPermissions
from rest_framework.response import Response

from apps.api.permissions import BidPermission, ContractorBidPermission,  IsPrimary, PublicReadProjectOwnerEditPermission, AuthedCreateRead, IsProfile, IsSenderReceiver
from accounts.models import Skills
from business.models import Employee
from business.serializers import *
from generics.viewsets import NestedModelViewSet, CreatorPermissionsMixin
from generics.utils import send_mail
from product.models import Order


# TODO Permissions update
class NDAUpdate(generics.UpdateAPIView):
    queryset = NDA.objects.all()
    serializer_class = NDASerializer
    permision_classes = (IsAuthenticated, IsSenderReceiver)


class CompanyListCreate(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def create(self, request, *args, **kwargs):
        request.data['user_id'] = request.data.get('user_id', request.user.id)
        return super(CompanyListCreate, self).create(request, *args, **kwargs)


class CompanyDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = (IsAuthenticated, IsPrimary)


class ProjectViewSet(viewsets.ModelViewSet):
    ""
    serializer_class = ProjectSerializer
    permission_classes = (PublicReadProjectOwnerEditPermission, )
    lookup_field = 'slug_or_id'

    def get_queryset(self):
        queryset = Project.objects.filter(project_manager=self.request.user, deleted=False)
        return queryset

    def get_object(self):
        slug_or_id = self.kwargs['slug_or_id']
        project = None
        if type(slug_or_id) == int or re.match(r'^[0-9]+$', slug_or_id):
            try:
                project = Project.objects.get(id=slug_or_id)
            except (Project.DoesNotExist, ValueError):
                pass
        if not project:
            try:
                project = Project.objects.get(slug=slug_or_id)
            except (Project.DoesNotExist, ValueError):
                pass
        if not project:
            chunks = slug_or_id.split('-')
            if len(chunks) > 1:
                id = chunks[-1]
                try:
                    project = Project.objects.get(id=id)
                except (Project.DoesNotExist, ValueError):
                    pass
        if not project:
            raise Http404('No such project %s' % slug_or_id)
        self.check_object_permissions(self.request, project)
        return project

    def retrieve(self, request, slug_or_id=None):
        project = self.get_object()
        #TODO Add to serializer and permissions?
        if project.approved or request.user == project.project_manager or request.user.is_staff:
            response_data = self.get_serializer(project).data
            response_data['is_project_manager'] = request.user == project.project_manager
            return Response(response_data, status=200)
        else:
            return Response(status=403)

    def update(self, request, *args, **kwargs):
        # preauth if not approved but published and not published before
        # pull promo code to pass to preauth
        published = request.data.get('published', False)
        promo = request.data.get('promo', None)
        project = Project.objects.get(id=request.data['id'])
        if published and not project.published and not project.approved:
            project.preauth( promo=promo)
        return super(ProjectViewSet, self).update(request, *args, **kwargs)

    @detail_route(methods=['POST'])
    def activate(self, request, *args, **kwargs):
        project = self.get_object()
        if request.user == project.project_manager:
            project = project.activate()
            order = Order.objects.get(content_type__pk=project.content_type.id, object_id=project.id, status='active')
            send_mail('project-renewed', [project.project_manager], {
                'fname': project.project_manager.first_name,
                'title': project.title,
                'url': '{0}/project/{1}/'.format(settings.BASE_URL, project.slug),
                'date': order.date_created.strftime("%m/%d/%Y"),
                'card_type': order.card_type,
                'card_last_4': order.card_last_4,
                'description': order.product.description,
                'price': order.product.price / float(100)
            })
            response_data = self.get_serializer(project).data
            return Response(response_data, status=200)
        return Response(status=403)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12


class ProjectSearchViewSet(HaystackViewSet):
    """
    supports [drf-haystack queries](https://drf-haystack.readthedocs.io/en/latest/01_intro.html#query-time):

    * Every primary (non-foreign) field on the model is available for explicit query (`featured=true&type=technology`)
    * currently excludes deleted, unapproved and unpublished projects from indexing
    * Has an additional `text` field 
        * defined in a [haystack data template](http://django-haystack.readthedocs.io/en/v2.5.1/best_practices.html#well-constructed-templates) `apps/business/templates/search/indexes/business/project_text.txt`
        * currently includes `title, short_blurb, description, type, skills_str, status, city, state, remote, featured, mix`
        * boolean fields are inlined as `"mix" if mix else ""`
    * various `__operators` can be used on a field, such as [`__fuzzy`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_fuzziness), i.e. `text__fuzzy=tytle+txt` matches `"title text"`. The fuzz operator can also be used on a per-word basis in the form `text=tytle\~+txt\~` in the url.
        * Full list of `__operators`: `contains, exact, gt, gte, lt, lte, in, startswith, endswith, range, fuzzy`

    url encoding in general

    * `foo+bar #=> foo AND bar`
    * `foo,bar #=> foo OR bar`

    example queries

    * `10 < estimated_cash <= 100 #=> estimated_cash__lte=100&estimated_cash__gt=10`
    * `skills contains 11 or 16   #=> skills__contains=11,16`
    * `skills contains 11 or 15   #=> skills__contains=11+15`

    example search: [?featured=true&type=technology,finance&text=titleword+descriptionword](http://localhost:8000/api/search/project?featured=true&type=technology,finance&text=titleword+descriptionword)


    """
    index_models = [Project]
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSearchSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = (HaystackFilter, OrderingFilter,)
    ordering_fields = ('date_created')
    ordering = ('-date_created')


def skills_autocomplete(request):
    try:
        search_results = SearchQuerySet().autocomplete(skill_auto=request.GET.get('q', ''))[:5]
        suggestions = [result.name for result in search_results]
    except TypeError:
        suggestions = []
    # Make sure you return a JSON object, not a bare list.
    # Otherwise, you could be vulnerable to an XSS attack.
    the_data = json.dumps({
        'results': suggestions
    })
    return HttpResponse(the_data, content_type='application/json')


class EmployeeListCreate(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated, )


class EmployeeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated, IsProfile)


