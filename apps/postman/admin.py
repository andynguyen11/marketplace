from django.contrib import admin
from django.db.models import F

from postman.models import Message


class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sent_at', 'sender', 'recipient', 'subject', )

    def get_queryset(self, request):
        qs = super(MessageAdmin, self).get_queryset(request)
        return qs.filter(id=F('thread'))

admin.site.register(Message, MessageAdmin)
