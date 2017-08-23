from django.contrib import admin
from proposals.models import Proposal

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('id', 'create_date', 'submitter', 'project', )
    list_display_links = ('id', )
    search_fields = ( 'submitter', 'project', )