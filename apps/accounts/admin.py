from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from accounts.models import Profile, Role


class RoleFilter(admin.SimpleListFilter):
    title = _('role')
    parameter_name = 'role'

    def lookups(self, request, model_admin):
        roles = Role.objects.distinct('name')
        roles_list = ((role.name, role.display_name) for role in roles)
        return roles_list

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(roles__name__in=[self.value(), ])
        return queryset


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('email', 'last_name', 'first_name', 'score', )
    list_display_links = ('email', 'first_name', 'last_name', )
    list_filter = (RoleFilter, )
    search_fields = ('email', 'first_name', 'last_name', )

