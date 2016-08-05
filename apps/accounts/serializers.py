from rest_framework import serializers
from social.apps.django_app.default.models import UserSocialAuth

from accounts.models import Profile, Skills, SkillTest
from expertratings.serializers import SkillTestSerializer as ERSkillTestSerializer, SkillTestResultSerializer
from generics.utils import update_instance, field_names


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)


class SocialSerializer(serializers.ModelSerializer):
    extra_data = serializers.JSONField()

    class Meta:
        model = UserSocialAuth


class SkillsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skills
        exclude = ('protected', 'slug', )


#TODO Create an obfuscated profile
class ProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    linkedin = serializers.SerializerMethodField()
    all_skills = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'date_joined', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions', 'password')

    def get_photo_url(self, obj):
        return obj.get_photo

    def get_linkedin(self, obj):
        serializer = SocialSerializer(obj.linkedin)
        return serializer.data

    def get_all_skills(self, obj):
        serializer = SkillsSerializer(Skills.objects.all(), many=True)
        return serializer.data


class SkillTestSerializer(serializers.ModelSerializer):

    skills = serializers.CharField()
    test_details = ERSkillTestSerializer(read_only=True)
    results = SkillTestResultSerializer(many=True, read_only=True)

    class Meta:
        model = SkillTest
        fields = field_names(SkillTest) + ('skills', 'results', 'test_details')

    def create(self, data):
        test = super(SkillTestSerializer, self).create(data)
        test.create_ticket()
        return test

    def update(self, instance, data):
        update_instance(instance, data)
        instance.create_ticket()
        return instance