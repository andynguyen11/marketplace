from django.contrib import admin

from business.models import Company, Job, Project, ConfidentialInfo, Document
from generics.admin import AttachmentInline

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    readonly_fields = ('stripe', )
    list_display = ('name', 'primary_contact', 'city', 'state', )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'project_manager', )


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('project', 'developer', 'date_created', 'status', )
    inlines = [AttachmentInline]


@admin.register(ConfidentialInfo)
class InfoAdmin(admin.ModelAdmin):
    list_display = ('project', 'title', 'summary', )
    inlines = [AttachmentInline]


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('project', 'type', 'status', )
