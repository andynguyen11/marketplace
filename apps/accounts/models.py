import tagulous.models

from django.db import models
from django.contrib.auth.models import AbstractUser


class Profile(AbstractUser):
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    zipcode = models.IntegerField(blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    photo = models.ImageField(blank=True, upload_to='profile')
    signup_code = models.CharField(max_length=25, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)

    @property
    def linkedin(self):
        return self.social_auth.get(provider='linkedin-oauth2')