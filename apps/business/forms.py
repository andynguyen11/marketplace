from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field, Submit, Div
from crispy_forms.bootstrap import PrependedText, Container, Tab, TabHolder, FormActions, AppendedText
from django import forms
from django.conf import settings

from business.models import Project, ProjectInfo


class ProjectForm(forms.ModelForm):
    photo = forms.ImageField(label='Choose file')
    class Meta:
        model = Project
        exclude = ['company', 'project_manager', 'date_created', 'status', 'remote', 'featured', ]

class InfoForm(forms.ModelForm):
    class Meta:
        model = ProjectInfo
        exclude = ['attachments', ]