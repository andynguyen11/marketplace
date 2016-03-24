from django.contrib import admin

from apps.accounts.models import Profile, Developer, ProjectManager

@admin.register(Profile)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'email')

@admin.register(Developer)
class BusinessContactAdmin(admin.ModelAdmin):
    list_display = ('profile', )

@admin.register(ProjectManager)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('profile', )