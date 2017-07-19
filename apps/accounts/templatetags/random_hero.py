from django import template
import random

register = template.Library()

@register.simple_tag
def random_slide_content():
    return random.randint(1, 3)
