from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from social.apps.django_app.default.models import UserSocialAuth
from html_json_forms.serializers import JSONFormSerializer

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from drf_haystack.serializers import HaystackSerializer
from notifications.models import Notification

from accounts.enums import ROLES
from accounts.models import Profile, ContactDetails, Skills, SkillTest, VerificationTest, Role
from apps.api.search_indexes import UserIndex
from business.models import Employee, Invite
from business.serializers import EmployeeSerializer, ProjectNotificationSerializer
from expertratings.serializers import SkillTestSerializer as ERSkillTestSerializer, SkillTestResultSerializer
from expertratings.models import SkillTest as ERSkillTest
from expertratings.exceptions import ExpertRatingsAPIException
from expertratings.utils import nicely_serialize_verification_tests
from generics.models import Attachment
from generics.utils import update_instance, field_names
from generics.serializers import ParentModelSerializer, AttachmentSerializer
from generics.validators import image_validator
from generics.base_serializers import RelationalModelSerializer
from proposals.models import Proposal


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

    class Meta:
        model = Skills
        fields = ('name', )
        extra_kwargs = {
            'name': {
                'validators': [],
            }
        }


class RoleSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(required=False)

    class Meta:
        model = Role


class ContactDetailsSerializer(RelationalModelSerializer):

    email = serializers.CharField(required=False)
    profile = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all(), required=False)

    class Meta:
        model = ContactDetails

    def different_email(self, data):
        return (data.get('email', None)) and (data.get('email', None) != data['profile'].email)

    def resolve_relations(self, data):
        if not self.different_email(data):
            data['email'] = data['profile'].email
            data['email_confirmed'] = data['profile'].email_confirmed
        return data


class ObfuscatedProfileSerializer(serializers.ModelSerializer):
    id = serializers.ModelField(model_field=Profile()._meta.get_field('id'))
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('id', 'first_name', 'last_name', 'email', 'photo_url', 'roles', 'capacity', 'city', 'state', 'country', 'location')

    def get_photo_url(self, obj):
        return obj.get_photo


class ProfileSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(write_only=True, max_length=settings.MAX_FILE_SIZE, validators=[image_validator],
                                   allow_empty_file=False, required=False, allow_null=True)
    photo_url = serializers.SerializerMethodField()
    skills = SkillsSerializer(many=True, required=False)
    roles = RoleSerializer(many=True, required=False)
    all_skills = serializers.SerializerMethodField()
    skills_test = serializers.SerializerMethodField()
    work_history = serializers.SerializerMethodField()
    work_examples = serializers.SerializerMethodField()
    contact_details = serializers.SerializerMethodField()
    invited = serializers.SerializerMethodField()


    class Meta:
        model = Profile
        exclude = ('is_superuser', 'last_login', 'date_joined', 'is_staff', 'is_active', 'stripe', 'signup_code', 'groups', 'user_permissions',)
        public_fields = ( # this is just used in the view atm
                'first_name', 'location', 'country', 'city', 'state',
                'title', 'roles', 'biography', 'capacity',
                'work_history', 'work_examples', 'long_description',
                'photo_url', 'photo' 'featured', 'skills', 'id',
                'my_skills', 'skills_test', 'invited')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'referral_code': {'write_only': True, 'required': False},
        }

    def get_invited(self, obj):
        # TODO support multiple projects
        if self.context['request'].user.is_authenticated():
            invited = Invite.objects.filter(recipient=obj, sender=self.context['request'].user)
            proposals = Proposal.objects.filter(submitter=obj, project__project_manager=self.context['request'].user)
            return True if invited or proposals else False
        return False

    def get_photo_url(self, obj):
        return obj.get_photo

    def get_all_skills(self, obj):
        serializer = SkillsSerializer(Skills.objects.filter(protected=True), many=True)
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

    def update_roles(self, roles, instance):
        instance.roles.clear()
        for role in roles:
            if 'years' not in role:
                role['years'] = None
            role['display_name'] = ROLES[role['category']][role['name']]
            new_role, created = Role.objects.get_or_create(**role)
            instance.roles.add(new_role)
        return instance

    def create(self, validated_data):
        if 'roles' in validated_data:
            roles = validated_data.pop('roles')
        profile = Profile.objects.create(**validated_data)
        profile = self.update_roles(roles, profile)
        profile.save()
        return profile

    def update(self, instance, validated_data):
        if 'photo' in validated_data: #Hacky way to resolve empty roles/skills when passing form data
            validated_data.pop('roles')
            validated_data.pop('skills')
        if validated_data.get('skills', None):
            skills = validated_data.pop('skills')
            instance.skills = [skill['name'] for skill in skills]
        if validated_data.get('roles', None):
            roles = validated_data.pop('roles')
            instance = self.update_roles(roles, instance)
        email = validated_data.get('email', None)
        if email and instance.email != email:
            instance.username = email
        if validated_data.get('password', None):
            password = validated_data.pop('password')
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
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


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = ('unread', )


# TODO Update `target` to check instance types - not only projects
class NotificationsSerializer(serializers.ModelSerializer):
    actor = ObfuscatedProfileSerializer()
    verb = serializers.CharField()
    target = ProjectNotificationSerializer(read_only=True)
    type = serializers.SerializerMethodField()
    action_object = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ('unread', 'actor', 'verb', 'target', 'timestamp', 'action_object', 'type' )

    def get_type(self, obj):
        if 'type' in obj.data:
            return obj.data['type']

        return None

    def get_action_object(self, obj):
        return {'id': obj.action_object.id}


class ProfileSearchSerializer(HaystackSerializer):

    class Meta:
        index_classes = [UserIndex]
        fields = [
            "profile_id", "first_name", "location", "photo",
            "roles", "skills", "email_notifications", "city", "state", "country",
            "long_description", "job_descriptions", "job_titles", "text", "examples", "featured"
        ]
        ignore_fields = ["text", "job_descriptions", "job_titles", "examples", "featured",]
