from django import forms

from accounts.models import Profile


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('notes', 'signup_code')
        fields = ('role', 'photo', 'biography', 'capacity', 'skills')
