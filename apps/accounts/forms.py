from django import forms

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Fieldset, Submit

from accounts.models import Profile


class DeveloperOnboardForm(forms.ModelForm):
    class Meta:
        model = Profile
        exclude = ('notes', 'signup_code')
        fields = ('first_name', 'last_name', 'role', 'photo', 'biography', 'capacity', 'skills')


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


class LoginForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = Profile
        fields = ('email', 'password')

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_show_labels = False
        self.helper.form_tag = False
        self.helper.layout = Layout(
            Field('email', placeholder='Email', required=True),
            Field('password', placeholder='Password', required=True)
        )


class SignupForm(LoginForm):

    def clean_email(self):
        email = self.cleaned_data['email']
        email_query = Profile.objects.filter(email=email)
        if email_query.exists():
            raise forms.ValidationError('This email has already been registered')
        return email
