from django.contrib.contenttypes.admin import GenericStackedInline
from django.contrib import admin
from django.contrib.flatpages.admin import FlatPageAdmin
from django.contrib.flatpages.models import FlatPage
from django.db import models

from .models import Attachment

class AttachmentInline(GenericStackedInline):
    model = Attachment


