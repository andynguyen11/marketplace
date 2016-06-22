from .models import Attachment
from django.contrib.contenttypes.admin import GenericStackedInline

class AttachmentInline(GenericStackedInline):
    model = Attachment
