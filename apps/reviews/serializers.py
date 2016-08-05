from rest_framework import serializers

from reviews.models import DeveloperReview


class DeveloperReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeveloperReview