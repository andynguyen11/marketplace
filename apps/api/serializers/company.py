from rest_framework import serializers

from business.models import Company, Employee
from generics.utils import update_instance, field_names


class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = field_names(Company, exclude=('stripe',)) + ('type',)

    def create(self, data):
        user = self.context['request'].user
        company = Company.objects.create(**data)
        Employee.objects.create(profile=user, company=company, primary=True)
        return company

    def update(self, instance, data):
        update_instance(instance, data)
        return instance