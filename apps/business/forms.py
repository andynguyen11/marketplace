from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, Div
from crispy_forms.bootstrap import PrependedText, Container, Tab, TabHolder, FormActions, AppendedText
from django import forms
from django.conf import settings

from apps.business.models import Company


class PartialCompanyForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(PartialCompanyForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        self.helper.layout = Layout(
            Div('business_type', css_class='col-sm-12'),
            Div('name', css_class='col-sm-12'),
            Div('ein', css_class='col-sm-12'),
            Div('phone', css_class='col-sm-12'),
            Div('address', css_class='col-sm-12'),
            Div('address2', css_class='col-sm-12'),
            Div('city', css_class='col-sm-4'),
            Div('state', css_class='col-sm-4'),
            Div('zipcode', css_class='col-sm-4'),
            Div('logo', css_class='col-sm-12'),
            Div('description', css_class='col-sm-12'),
            Div('bonded', css_class='col-sm-4'),
            Div('insured', css_class='col-sm-4'),
            Div('licensed', css_class='col-sm-4'),
            Div('bank_routing', css_class='col-sm-6'),
            Div('bank_account', css_class='col-sm-6'),
            Div('dispute_resolution', css_class='col-sm-12'),

        )

    phone = forms.CharField(label='Business Phone')
    bonded = forms.BooleanField(label='Are you bonded?', required=False)
    insured = forms.BooleanField(label='Are you insured?', required=False)
    licensed = forms.BooleanField(label='Are you licensed?', required=False)
    bank_routing = forms.CharField(required=True)
    bank_account = forms.CharField(required=True)
    dispute_resolution = forms.BooleanField(required=False, label='I agree to be bound by the Dispute Resolution clause of the Service Provider Agreement')

    class Meta:
        model = Company
        exclude = ['primary_contact', 'stripe', 'sales_tax', 'fee_percentage', 'fee_amount', 'services', 'service_area',
                   'proof_of_bonding', 'proof_of_insurance', 'proof_of_license']


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