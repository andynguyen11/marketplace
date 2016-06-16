from rest_framework import serializers

from accounts.models import Profile
from business.models import Company, Document
from reviews.models import DeveloperReview


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'password', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions', )





class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)


class DeveloperReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeveloperReview

