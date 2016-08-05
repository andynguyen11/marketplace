from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.http import HttpResponseForbidden

from apps.api.permissions import IsOwner
from reviews.models import DeveloperReview
from reviews.serializers import DeveloperReviewSerializer


class ReviewListCreate(generics.ListCreateAPIView):
    serializer_class = DeveloperReviewSerializer
    permission_classes = (IsAuthenticated, )
    renderer_classes = (JSONRenderer, )

    def get_queryset(self):
        return DeveloperReview.objects.filter(developer=self.request.query_params['developer']).order_by('create_date')