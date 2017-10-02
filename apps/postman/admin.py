from django.contrib.admin.utils import unquote
from django.contrib import admin
from django.db.models import F
from django.template.response import TemplateResponse

from postman.models import Message


class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sent_at', 'sender', 'recipient', 'subject', )

    def get_queryset(self, request):
        qs = super(MessageAdmin, self).get_queryset(request)
        return qs.filter(id=F('thread')).exclude(body__exact='')

    def change_view(self, request, object_id, form_url='', extra_context=None):
        to_field = request.GET.get('_to_field')
        model = self.model
        opts = model._meta
        obj = self.get_object(request, unquote(object_id), to_field)
        messages = Message.objects.filter(thread=obj).exclude(body__exact='')

        context = dict(
            self.admin_site.each_context(request),
            title='Messages',
            opts=opts,
            object_id=object_id,
            original=obj,
            messages=messages
        )

        return TemplateResponse(request, "admin/%s/%s/change_form.html" % (opts.app_label, opts.model_name), context)


admin.site.register(Message, MessageAdmin)
