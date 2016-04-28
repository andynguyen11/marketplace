from django.contrib import admin

from business.models import Company, Job, Project, Document


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


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('project', 'type', 'status', )