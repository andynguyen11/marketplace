from django.contrib import admin
from accounts.models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'email')

