import datetime
import factory
from factory import fuzzy

from payment.models import Invoice, InvoiceItem


class InvoiceItemFactory(factory.DjangoModelFactory):

    class Meta:
        model = InvoiceItem

    invoice = factory.SubFactory('payment.factories.InvoiceFactory', invoice=None)
    description = factory.FuzzyText(length=100)
    hours = fuzzy.FuzzyInteger(low=20, high=400, step=3)
    rate = fuzzy.FuzzyInteger(low=10, high=150, step=3)
    amount = fuzzy.FuzzyInteger(low=1000, high=7000, step=20)


class InvoiceFactory(factory.DjangoModelFactory):

    class Meta:
        model = Invoice

    invoice_item = factory.RelatedFactory(InvoiceItemFactory, 'invoice_item', action=models.InvoiceItem.ACTION_CREATE)
    title = fuzzy.FuzzyText(length=100)
    sent_date = datetime.date(2014, 11, 12)
    due_date = datetime.date(2014, 11, 12)