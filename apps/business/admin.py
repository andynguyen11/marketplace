from django.contrib import admin

from business.models import Company, Project, Document
from generics.admin import AttachmentInline

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    readonly_fields = ('stripe', )
    list_display = ('name', 'city', 'state', )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'project_manager', )
    search_fields = ('title', 'company__name', 'project_manager__email', 'project_manager__first_name', 'project_manager__last_name',  )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('type', 'status', )

