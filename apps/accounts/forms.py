from django import forms

from accounts.models import Profile


class DeveloperOnboardForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('notes', 'signup_code')
        fields = ('role', 'photo', 'biography', 'capacity', 'skills')


class ManagerOnboardForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('notes', 'signup_code')
        fields = ('first_name', 'last_name', 'title', 'biography', 'photo', 'location', 'skills', )


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('notes', 'signup_code')
        fields = ('first_name', 'last_name', 'location', 'capacity', 'photo', 'biography', )
