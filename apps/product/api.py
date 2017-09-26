from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView

from product.models import Order, Promo, get_promo
from product.serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user)
        return queryset


class PromoCheck(RetrieveAPIView):
    " Simple Promo checking view "
    permission_classes = (IsAuthenticated, )

    def get(self, request, code=None):
        promo = get_promo(code or request.query_params.get('code', None))
        if not promo:
            return Response(status=400, data='This promo code is invalid.')

        if promo.is_valid_for(request.user):
            if promo.not_expired():
                return Response(status=200, data={'is_valid': True, 'value': promo.value_off})
            else:
                return Response(status=400, data='This promo code has expired.')
        else:
            return Response(status=400, data='This promo code has already been used.')