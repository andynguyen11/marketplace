from django.contrib import admin

from business.models import Company, Project
from generics.admin import AttachmentInline

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    readonly_fields = ('stripe', )
    list_display = ('name', 'city', 'state', )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'published', 'approved', 'company', 'project_manager', )
    list_filter = ('published', 'approved', )
    search_fields = ('title', 'company__name', 'project_manager__email', 'project_manager__first_name', 'project_manager__last_name',  )

