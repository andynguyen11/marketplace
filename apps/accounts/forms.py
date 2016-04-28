from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, Div
from crispy_forms.bootstrap import TabHolder, Tab, PrependedText, FormActions
from django import forms
from django.contrib.auth.models import User
from django.conf import settings

from accounts.models import Customer, BusinessContact


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Customer
        exclude = ('stripe',)


class SignupForm(forms.ModelForm):
    """
    A form that creates a user.
    """
    def __init__(self, *args, **kwargs):
        super(SignupForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False

    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "password", )

    def save(self, commit=True):
        user = super(SignupForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password"])
        user.username = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class SignupFormVerbose(SignupForm):
    """
    A form that creates a user.
    """
    def __init__(self, *args, **kwargs):
        super(SignupFormVerbose, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        self.helper.layout = Layout(
            Div('email', css_class="col-sm-6"),
            Div('password', css_class="col-sm-6"),
            Div('first_name', css_class="col-sm-6"),
            Div('last_name', css_class="col-sm-6")
        )

    first_name = forms.CharField(required=True, label='Legal First Name')
    last_name = forms.CharField(required=True, label='Legal Last Name')
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "password", )


class BusinessContactForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(BusinessContactForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        self.helper.layout = Layout(
            Div(Field('date_of_birth', data_format="MM/DD/YYYY", data_template="MMM D YYYY"), css_class="col-sm-6"),
            Div('phone_number', css_class="col-sm-6"),
            Div('last_4_ssn', css_class="col-sm-6"),
            Div('photo', css_class="col-sm-6")
        )

    date_of_birth = forms.DateField(required=True)
    phone_number = forms.CharField(label='Contact Phone')
    last_4_ssn = forms.CharField(required=True, label='Last 4 of Social Security', max_length=4)

    class Meta:
        model = BusinessContact
        fields = ("phone_number", "date_of_birth", "last_4_ssn", "photo", )


class InvoiceForm(forms.Form):
    pass


class LoginForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.layout = Layout(
            Field('email'),
            Field('password'),
            FormActions(
                Submit('login', 'Log In'),
            )
        )

    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput())