from rest_framework import serializers
from social.apps.django_app.default.models import UserSocialAuth
from html_json_forms.serializers import JSONFormSerializer

from accounts.models import Profile, Skills, SkillTest, VerificationTest
from business.models import Employee
from business.serializers import EmployeeSerializer
from expertratings.serializers import SkillTestSerializer as ERSkillTestSerializer, SkillTestResultSerializer
from expertratings.models import SkillTest as ERSkillTest
from expertratings.exceptions import ExpertRatingsAPIException
from generics.utils import update_instance, field_names
from generics.serializers import ParentModelSerializer
from generics.base_serializers import RelationalModelSerializer


class PaymentSerializer(serializers.Serializer):
    brand = serializers.CharField(max_length=100)
    last4 = serializers.CharField(max_length=10)
    exp_month = serializers.CharField(max_length=10)
    exp_year = serializers.CharField(max_length=10)


class SocialSerializer(serializers.ModelSerializer):
    extra_data = serializers.JSONField()

    class Meta:
        model = UserSocialAuth


class VerificationTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationTest
        exclude = ('skill', )


class SkillsSerializer(serializers.ModelSerializer):
    verification_tests = VerificationTestSerializer(source='verificationtest_set', many=True, read_only=True)

    class Meta:
        model = Skills
        exclude = ('protected', 'slug', )


class ObfuscatedProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('id', 'first_name', 'photo_url')

    def get_photo_url(self, obj):
        return obj.get_photo


class ProfileSerializer(JSONFormSerializer, ParentModelSerializer):
    photo_url = serializers.SerializerMethodField()
    linkedin = serializers.SerializerMethodField()
    all_skills = serializers.SerializerMethodField()
    skills_data = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    signup = serializers.BooleanField(write_only=True, required=False)
    work_history = serializers.SerializerMethodField()


    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'date_joined', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions',)
        public_fields = ( # this is just used in the view atm
                'first_name', 'last_name', 'username',
                'location', 'country', 'city', 'state',
                'title', 'role', 'biography', 'work_history',
                'photo_url', 'photo' 'featured', 'skills', 'id')

    def get_photo_url(self, obj):
        return obj.get_photo

    def get_linkedin(self, obj):
        serializer = SocialSerializer(obj.linkedin)
        return serializer.data

    def get_all_skills(self, obj):
        serializer = SkillsSerializer(Skills.objects.all(), many=True)
        return serializer.data

    def get_skills_data(self, obj):
        return [dict(
                    verified = skill.is_verified(obj),
                    **SkillsSerializer(skill).data
                    ) for skill in obj.get_skills()]

    def get_work_history(self, obj):
        serializer = EmployeeSerializer(Employee.objects.filter(profile=obj), many=True)
        return serializer.data

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.username = validated_data.get('email', instance.email)
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class SkillTestSerializer(serializers.ModelSerializer):

    skills = serializers.CharField(required=False)
    test_details = ERSkillTestSerializer(read_only=True)
    results = SkillTestResultSerializer(many=True, read_only=True)

    class Meta:
        model = SkillTest
        fields = field_names(SkillTest) + ('skills', 'results', 'test_details')

    def create(self, data):
        test = super(SkillTestSerializer, self).create(data)
        try:
            test.create_ticket()
        except ExpertRatingsAPIException, e:
            test.delete()
            raise e
        return test

    def update(self, instance, data):
        update_instance(instance, data)
        instance.create_ticket()
        return instance
