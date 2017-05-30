from django.contrib import admin
from accounts.models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('email', 'last_name', 'first_name', )
    list_display_links = ('email', 'first_name', 'last_name', )
    search_fields = ('email', 'first_name', 'last_name', )

