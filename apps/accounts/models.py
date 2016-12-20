import tagulous.models
import stripe
import StringIO
import os
from uuid import uuid4
from PIL import Image

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils.deconstruct import deconstructible
from django.core.files.uploadedfile import InMemoryUploadedFile
from tagulous.models.tagged import TaggedManager as CastTaggedUserManager
from social.apps.django_app.default.models import UserSocialAuth
from expertratings.models import SkillTestResult

from business.models import Employee


# TODO Hacky way to bypass makemigrations error
# ValueError: Could not find manager CastTaggedUserManager in tagulous.models.tagged.
class CustomUserManager(UserManager, CastTaggedUserManager):
    pass


class Skills(tagulous.models.TagModel):
    class TagMeta:
        # Tag options
        initial = [
            'Python',
            'JQuery',
            'Angular.js',
            'nginx',
            'uwsgi',
        ]
        autocomplete_view = 'skills_autocomplete'

    verification_tests = models.ManyToManyField('expertratings.SkillTest', through='VerificationTest')

    def is_verified(self, user):
        return SkillTestResult.objects.filter(
                user=user, test__in=self.verification_tests.all(), test_result='PASS').exists()


class VerificationTestManager(models.Manager):
    def taken(self, user):
        return self.filter(skilltest__in = user.taken_tests)

    def not_taken(self, user):
        return self.exclude(skilltest__in = user.taken_tests)

    def recommended(self, user):
        return self.not_taken(user).filter(skill__in = user.get_skills())


class VerificationTest(models.Model):
    objects = VerificationTestManager()

    skill = models.ForeignKey(Skills, on_delete=models.CASCADE)
    skilltest = models.ForeignKey('expertratings.SkillTest', on_delete=models.CASCADE)
    relevance = models.FloatField()

    class Meta:
        ordering = ('-relevance',)


class SkillTest(models.Model):

    class Meta:
        unique_together = ("profile", "expertratings_test")

    profile = models.ForeignKey('accounts.Profile')
    expertratings_test = models.ForeignKey('expertratings.SkillTest')
    skills = tagulous.models.TagField(to=Skills)
    ticket_url = models.CharField(max_length=255, blank=True, null=True)


    @property
    def developer(self):
        return self.profile

    def create_ticket(self):
        self.ticket_url = self.expertratings_test.create_ticket(user_id = self.developer.id)
        self.save()
        return self.ticket_url

    @property
    def results(self):
        return self.expertratings_test.results(user=self.developer)

    @property
    def test_details(self):
        return self.expertratings_test


class ContactDetails(models.Model):
    """
    All Contact Details / PII for a user
    """
    profile = models.ForeignKey('accounts.Profile', primary_key=True)

    email = models.CharField(max_length=50)
    email_confirmed = models.BooleanField(default=False)
    phone = models.CharField(max_length=50)
    website = models.CharField(max_length=50, blank=True, null=True)
    skype = models.CharField(max_length=50, blank=True, null=True)
    linkedin = models.CharField(max_length=50, blank=True, null=True)
    angellist = models.CharField(max_length=50, blank=True, null=True)
    github = models.CharField(max_length=50, blank=True, null=True)
    instagram = models.CharField(max_length=50, blank=True, null=True)
    twitter = models.CharField(max_length=50, blank=True, null=True)
    facebook = models.CharField(max_length=50, blank=True, null=True)

    @property
    def id(self):
        return self.profile.id



def path_and_rename(instance, filename):
    upload_to = 'profile-photos'
    ext = filename.split('.')[-1]
    # get filename
    if instance.pk:
        filename = '{}{}.{}'.format(uuid4().hex, instance.pk, ext)
    else:
        # set filename as random string
        filename = '{}.{}'.format(uuid4().hex, ext)
    # return the whole path to the file
    return os.path.join(upload_to, filename)


class Connection(models.Model):
    """
    TODO: When implementing the `request_connection` api:
    * Add `from_type = { REQUESTER, REQUESTEE }`
    * Add `status = { requested, accepted, connected }`
    * Don't show `contact_details` unless `status == connected`
    """
    class Meta:
        unique_together = ('from_profile', 'to_profile')

    date_created = models.DateTimeField(auto_now_add=True)
    from_profile = models.ForeignKey('accounts.Profile', related_name='from_profile')
    to_profile = models.ForeignKey('accounts.Profile', related_name='to_profile')


class Profile(AbstractUser):

    address = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    photo = models.ImageField(blank=True, null=True, upload_to=path_and_rename)
    skills = tagulous.models.TagField(to=Skills, blank=True)
    signup_code = models.CharField(max_length=25, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    stripe = models.CharField(max_length=255, blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    objects = CustomUserManager()
    email_notifications = models.BooleanField(default=True)
    email_confirmed = models.BooleanField(default=False)
    featured = models.BooleanField(default=False)

    connections = models.ManyToManyField('self', through='Connection', symmetrical=False, related_name='reverse_connections+')

    def connect(self, to_profile):
        Connection.objects.create(from_profile=self, to_profile=to_profile)
        Connection.objects.create(to_profile=self, from_profile=to_profile)

    @property
    def name(self):
        return '{0} {1}'.format(self.first_name, self.last_name)

    @property
    def get_photo(self):
        if self.photo:
            return '{0}{1}'.format(settings.MEDIA_URL, self.photo)
        else:
            try:
                return self.social_auth.get(provider='linkedin-oauth2').extra_data['picture_urls']['values'][0]
            except:
                return ''

    @property
    def linkedin(self):
        try:
            return self.social_auth.get(provider='linkedin-oauth2')
        except UserSocialAuth.DoesNotExist:
            return None

    @property
    def company(self):
        """
        TODO Needs to support multiple primary companies
        """
        try:
            return Employee.objects.get(profile=self, primary=True).company
        except Employee.DoesNotExist:
            return None

    @property
    def contact_details(self):
        details, created = ContactDetails.objects.get_or_create(profile=self)
        if created:
            details.email = self.email
            details.save()
        return details

    def get_skills(self):
        return self.skills.all()

    @property
    def skilltests(self):
        return SkillTest.objects.filter(profile=self)

    @property
    def taken_tests(self):
        return [t.expertratings_test for t in self.skilltests]

    def get_default_payment(self):
        if self.stripe:
            stripe.api_key = settings.STRIPE_KEY
            stripe_customer = stripe.Customer.retrieve(self.stripe)
            for card in stripe_customer['sources']['data']:
                if card['id'] == stripe_customer['default_source']:
                    # TODO Manually serialize card, circular import error if using api serializer
                    return card
        return None

    # TODO This image crop breaks if it's not a jpg
    #def save(self, *args, **kwargs):
        #if self.photo:
        #    try:
        #        current = Profile.objects.get(id=self.id)
        #        if current.photo == self.photo:
        #            self.photo = current.photo
        #        else:
        #            current.photo.delete(save=False)
        #    except:
        #        pass
        #    img = Image.open(self.photo)
        #    width, height = img.size
        #    if height > width:
        #        top = int((height - width) / 2)
        #        img = img.crop((0, top, width, width + top))
        #    elif width > height:
        #        left = int((width - height) / 2)
        #        img = img.crop((left, 0, height + left, height))
        #    elif img.mode == "RGBA":
        #        # Check if the image has a transparent background.
        #        background = Image.new("RGB", img.size, (255, 255, 255))
        #        background.paste(img, mask=img.split()[3])
        #        img = background
        #    output = StringIO.StringIO()
        #    img.save(output, format='JPEG')
        #    output.seek(0)
        #    self.photo = InMemoryUploadedFile(output, 'ImageField', "%s.jpg" % self.photo.name.split('.')[0], 'image/jpeg', output.len, None)
        #super(Profile, self).save(*args, **kwargs)

Profile._meta.get_field('username').max_length = 75


