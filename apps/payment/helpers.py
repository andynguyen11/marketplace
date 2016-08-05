from payment.models import Promo


def promo_check(code, customer):
    try:
        code = code.upper()
        promo = Promo.objects.get(code=code)
        if promo.single_use and promo.used:
            return None
        if customer in promo.customers.all():
            return None
        return promo
    except Promo.DoesNotExist:
        return None
