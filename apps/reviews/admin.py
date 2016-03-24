from django.contrib import admin

from apps.reviews.models import CompanyReview, DeveloperReview


@admin.register(DeveloperReview)
class DeveloperReviewAdmin(admin.ModelAdmin):
    list_display = ('job', 'developer', 'rating')

@admin.register(CompanyReview)
class CompanyReviewAdmin(admin.ModelAdmin):
    list_display = ('job', 'company', 'rating')