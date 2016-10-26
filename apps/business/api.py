import simplejson

from django.http import HttpResponseForbidden, Http404
from drf_haystack.viewsets import HaystackViewSet
from rest_framework import generics, viewsets, authentication, permissions
from rest_framework.views import APIView
from rest_framework.decorators import detail_route, list_route, permission_classes
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, DjangoObjectPermissions
from rest_framework.response import Response

from apps.api.permissions import BidPermission, ContractorBidPermission, ContracteeTermsPermission,  IsPrimary, IsJobOwnerPermission, IsProjectOwnerPermission, AuthedCreateRead, IsProfile
from business.models import Job, Employee
from business.serializers import *
from generics.viewsets import NestedModelViewSet, CreatorPermissionsMixin
from generics.utils import send_mail


class AgreeTerms(APIView): # TODO this and other terms views can be folded into a viewset
    """
    View to update terms to agreed
    Only Contractors can agree to Terms, but they cannot edit them
    """
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        """
        Update to agreed on post
        """
        terms = Terms.objects.get(id=request.data['terms_id'])
        if request.user == terms.job.contractor: # SECURED
            terms.status = 'agreed'
            terms.save()
            serializer = TermsSerializer(terms)
            return Response(serializer.data)
        return Response(status=403)


# Bids are Jobs - only contractors should be able to edit
class JobViewSet(viewsets.ModelViewSet):
    """
    Only Contractors can create Jobs/Bids.
    Subsequently Project Managers create Terms based on them
    """
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = (IsAuthenticated, ContractorBidPermission)

    def create(self, request, *args, **kwargs):
        # DRF doesn't recognize blank strings as null values, replace with None
        cash = request.data['cash']
        equity = request.data['equity']
        request.data['cash'] = cash if cash else None
        request.data['equity'] = equity if equity else None
        return super(JobViewSet, self).create(request, *args, **kwargs)


class NestedJobViewSet(NestedModelViewSet):
    """
    Only Contractors can create Jobs/Bids.
    Subsequently Project Managers create Terms based on them
    """
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = (IsAuthenticated, ContractorBidPermission)
    parent_key = 'project'


class DocumentViewSet(NestedModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = (IsAuthenticated, BidPermission, IsJobOwnerPermission)
    parent_key = 'job'


# this isn't too insecure due to `self.contractee = ...` in `Terms.save`
class TermsListCreate(generics.ListCreateAPIView):
    """
    Only Contractees can generate Terms based on a Job/Bid.
    They should not be able to edit critical aspects of a Bid, such as compensation.
    """
    serializer_class = TermsSerializer
    permission_classes = (IsAuthenticated, )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        try:
            _ = (e for e in queryset)
            serializer = self.get_serializer(queryset, many=True)
        except TypeError:
            serializer = self.get_serializer(queryset)
        return Response(serializer.data)


    def get_queryset(self):
        queryset = Terms.objects.all()
        bid_id = self.request.query_params.get('bid', None)
        if bid_id is not None:
            bid = Job.objects.get(id=bid_id)
            queryset, created = Terms.objects.get_or_create(bid=bid)
        return queryset

class TermsRetrieveUpdate(generics.RetrieveUpdateAPIView):
    """
    Only Contractees can edit  Terms based on a Job/Bid.
    They should not be able to edit critical aspects of a Bid, such as compensation.
    """
    queryset = Terms.objects.all()
    serializer_class = TermsSerializer
    permission_classes = (IsAuthenticated, )


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


class InfoViewSet(NestedModelViewSet):
    ""
    queryset = ProjectInfo.objects.all()
    serializer_class = InfoSerializer
    parent_key = 'project'


class ProjectViewSet(viewsets.ModelViewSet):
    ""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = (IsAuthenticated, IsProjectOwnerPermission, )


class ProjectSearchView(HaystackViewSet):
    """
    supports [drf-haystack queries](https://drf-haystack.readthedocs.io/en/latest/01_intro.html#query-time):

    * Every primary (non-foreign) field on the model is available for explicit query (`featured=true&type=technology`)
    * Has an additional `text` field defined in a data template `apps/business/templates/search/indexes/business/project_text.txt`
    * various `__operators` can be used on a field, most pertinantly [`__fuzzy`](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_fuzziness), i.e. `text__fuzzy=tytle+txt` matches `"title text"`. The fuzz operator can also be used on a per-word basis in the form `text=tytle\~+txt\~` in the url.

    url encoding in general

    * `foo+bar #=> foo AND bar`
    * `foo,bar #=> foo OR bar`

    example search: [?featured=true&type=technology,finance&text=titleword+descriptionword](http://localhost:8000/api/search/project?featured=true&type=technology,finance&text=titleword+descriptionword)


    """
    index_models = [Project]
    serializer_class = ProjectSearchSerializer


class EmployeeListCreate(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated, )


class EmployeeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated, IsProfile)

