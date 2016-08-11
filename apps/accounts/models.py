import tagulous.models
import stripe
import StringIO
from PIL import Image

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils.deconstruct import deconstructible
from django.core.files.uploadedfile import InMemoryUploadedFile
from tagulous.models.tagged import TaggedManager as CastTaggedUserManager
from social.apps.django_app.default.models import UserSocialAuth

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


class Profile(AbstractUser):
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    photo = models.ImageField(blank=True, null=True, upload_to='profile-photos')
    skills = tagulous.models.TagField(to=Skills, blank=True)
    signup_code = models.CharField(max_length=25, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    stripe = models.CharField(max_length=255, blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    objects = CustomUserManager()

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
            except UserSocialAuth.DoesNotExist:
                return '{0}{1}'.format(settings.STATIC_URL, 'images/icon-profile.png')

    @property
    def linkedin(self):
        try:
            return self.social_auth.get(provider='linkedin-oauth2')
        except UserSocialAuth.DoesNotExist:
            return None

    @property
    def company(self):
        try:
            return Employee.objects.get(profile=self).company
        except Employee.DoesNotExist:
            return None

    def get_skills(self):
        return self.skills.tag_model.objects.all()

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


class SkillTest(models.Model):

    class Meta:
        unique_together = ("profile", "expertratings_test")

    profile = models.ForeignKey(Profile)
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
