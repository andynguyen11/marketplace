from rest_framework import viewsets

from product.models import Order
from product.serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user)
        return queryset