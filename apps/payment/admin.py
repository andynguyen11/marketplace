from django.contrib import admin

from payment.models import Promo, ProductOrder

@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = ('code', 'expire_date', 'value_off', )

@admin.register(ProductOrder)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'payer', 'recipient', 'status', 'price', 'fee')


