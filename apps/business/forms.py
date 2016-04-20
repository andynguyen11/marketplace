from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, Div
from crispy_forms.bootstrap import PrependedText, Container, Tab, TabHolder, FormActions, AppendedText
from django import forms
from django.conf import settings

from apps.business.models import Project


class ProjectForm(forms.ModelForm):

    class Meta:
        model = Project
        exclude = ['company', 'project_manager', 'date_created', 'status', 'remote', 'featured', ]


class CompanyForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(CompanyForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        self.helper.layout = Layout(
            Div('business_type', css_class='col-sm-12'),
            Div('name', css_class='col-sm-12'),
            Div('ein', css_class='col-sm-12'),
            Div('address', css_class='col-sm-12'),
            Div('address2', css_class='col-sm-12'),
            Div('city', css_class='col-sm-12'),
            Div('state', css_class='col-sm-12'),
            Div('zipcode', css_class='col-sm-12'),
            Div('phone', css_class='col-sm-12'),
            Div('logo', css_class='col-sm-12'),
            Div('description', css_class='col-sm-12'),
            Div('services', css_class='col-sm-12'),
            Div('service_area', css_class='col-sm-12'),
            Div('bank_routing', css_class='col-sm-12'),
            Div('bank_account', css_class='col-sm-12'),
            Div(AppendedText('sales_tax', '%'), css_class='col-sm-12'),
            Div(AppendedText('fee_percentage', '%'), css_class='col-sm-12'),
            Div(PrependedText('fee_amount', '$'), css_class='col-sm-12'),
            Div('bonded', css_class='col-sm-12'),
            Div('proof_of_bonding', css_class='col-sm-12'),
            Div('insured', css_class='col-sm-12'),
            Div('proof_of_insurance', css_class='col-sm-12'),
            Div('licensed', css_class='col-sm-12'),
            Div('proof_of_license', css_class='col-sm-12'),

        )

    class Meta:
        model = Company
        exclude = ['primary_contact', 'stripe', ]