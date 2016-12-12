from rest_framework import serializers
from social.apps.django_app.default.models import UserSocialAuth
from html_json_forms.serializers import JSONFormSerializer

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from accounts.models import Profile, ContactDetails, Skills, SkillTest, VerificationTest
from business.models import Employee
from business.serializers import EmployeeSerializer
from expertratings.serializers import SkillTestSerializer as ERSkillTestSerializer, SkillTestResultSerializer
from expertratings.models import SkillTest as ERSkillTest
from expertratings.exceptions import ExpertRatingsAPIException
from expertratings.utils import nicely_serialize_verification_tests
from generics.models import Attachment
from generics.utils import update_instance, field_names
from generics.serializers import ParentModelSerializer, AttachmentSerializer
from generics.validators import image_validator
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


class SkillsSerializer(serializers.ModelSerializer):
    verification_tests = VerificationTestSerializer(source='verificationtest_set', many=True, read_only=True)

    class Meta:
        model = Skills
        exclude = ('protected', 'slug', )


class ContactDetailsSerializer(RelationalModelSerializer):

    email = serializers.CharField(required=False)
    profile = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), required=False)

    class Meta:
        model = ContactDetails

    def resolve_relations(self, data):
        data['email'] = data.get('email', data['profile'].email)
        return data


class ObfuscatedProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('id', 'first_name', 'photo_url', 'role', 'capacity', 'city', 'state', 'country', 'location')

    def get_photo_url(self, obj):
        return obj.get_photo


class ProfileSerializer(JSONFormSerializer, ParentModelSerializer):
    photo = serializers.ImageField(write_only=True, max_length=settings.MAX_FILE_SIZE, allow_empty_file=False, validators=[image_validator])
    photo_url = serializers.SerializerMethodField()
    linkedin = serializers.SerializerMethodField()
    all_skills = serializers.SerializerMethodField()
    my_skills = serializers.SerializerMethodField()
    skills_test = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    signup = serializers.BooleanField(write_only=True, required=False)
    work_history = serializers.SerializerMethodField()
    work_examples = serializers.SerializerMethodField()

    contact_details = serializers.SerializerMethodField()


    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'date_joined', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions',)
        public_fields = ( # this is just used in the view atm
                'first_name', 'location', 'country', 'city', 'state',
                'title', 'role', 'biography',
                'work_history', 'work_examples', 'long_description',
                'photo_url', 'photo' 'featured', 'skills', 'id',
                'my_skills', 'skills_test')

    def get_photo_url(self, obj):
        return obj.get_photo

    def get_linkedin(self, obj):
        serializer = SocialSerializer(obj.linkedin)
        return serializer.data

    def get_all_skills(self, obj):
        serializer = SkillsSerializer(Skills.objects.all(), many=True)
        return serializer.data

    def get_skills_test(self, obj):
        summary = {
            key: nicely_serialize_verification_tests(values, obj)
            for key, values in {
                'testsTaken': VerificationTest.objects.taken(obj)
            }.items() }
        results = []
        for st in summary['testsTaken']:
            st['tests'] = [test for test in st.get('tests', []) if test.has_key('results') and test['results'][0]['result'] == 'PASS']
            if st['tests']:
                results.append(st)
        summary['testsTaken'] = results
        return summary

    def get_my_skills(self, obj):
        return [dict(
                    verified = skill.is_verified(obj),
                    **SkillsSerializer(skill).data
                    ) for skill in obj.skills.all()]

    def get_work_history(self, obj):
        serializer = EmployeeSerializer(Employee.objects.filter(profile=obj), many=True)
        return serializer.data

    def get_work_examples(self, obj):
        serializer = AttachmentSerializer(
            Attachment.objects.filter(
                content_type= ContentType.objects.get_for_model(Profile),
                object_id=obj.id
            ),
            many=True
        )
        return serializer.data

    def get_contact_details(self, obj):
        if obj.contact_details:
            details = ContactDetailsSerializer(obj.contact_details).data
            details.pop('profile')
            return details

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        email = validated_data.get('email', None)
        if email and instance.email != email:
            instance.username = email
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
