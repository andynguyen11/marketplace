import tagulous.models
import stripe

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.utils.deconstruct import deconstructible
from tagulous.models.tagged import TaggedManager as CastTaggedUserManager

from api.serializers import PaymentSerializer


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
    zipcode = models.IntegerField(blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    photo = models.ImageField(blank=True, upload_to='profile-images/')
    skills = tagulous.models.TagField(to=Skills)
    signup_code = models.CharField(max_length=25, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    stripe = models.CharField(max_length=255, blank=True, null=True)
    biography = models.TextField(blank=True, null=True)
    objects = CustomUserManager()

    @property
    def linkedin(self):
        return self.social_auth.get(provider='linkedin-oauth2')

    @property
    def linkedin_photo(self):
        return self.social_auth.get(provider='linkedin-oauth2').extra_data['picture_urls']['values'][0]

    def get_skills(self):
        return self.skills.tag_model.objects.all()

    def get_default_payment(self):
        if self.stripe:
            stripe.api_key = settings.STRIPE_KEY
            stripe_customer = stripe.Customer.retrieve(self.stripe)
            for card in stripe_customer['sources']['data']:
                if card['id'] == stripe_customer['default_source']:
                    serialized = PaymentSerializer(card)
                    return serialized.data
        return None