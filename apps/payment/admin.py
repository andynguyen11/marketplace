from django.contrib import admin

from payment.models import Promo

@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = ('code', 'expire_date', 'value_off', )


