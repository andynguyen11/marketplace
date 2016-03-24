from django import template


register = template.Library()

#TODO abstract this into helper functions
@register.simple_tag(takes_context=True)
def total(context, job):
    total = job.charge - job.fee
    total = float(total) - (float(job.charge)*.029) - .30
    return round(total, 2)

@register.simple_tag(takes_context=True)
def tax(context, job):
    tax_rate = float(job.provider.sales_tax/100)
    tax = float(job.charge)/(1+tax_rate) * tax_rate
    return round(tax, 2)

@register.simple_tag(takes_context=True)
def net(context, job):
    total = job.charge - job.fee
    total = float(total) - (float(job.charge)*.029) - .30
    tax_rate = float(job.provider.sales_tax/100)
    tax = float(job.charge)/(1+tax_rate) * tax_rate
    net = total - tax
    return round(net, 2)