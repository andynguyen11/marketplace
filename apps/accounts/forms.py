from django import forms
from django.conf import settings

from accounts.models import Profile


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('notes', 'signup_code')