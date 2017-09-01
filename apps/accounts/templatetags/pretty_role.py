from django import template

register = template.Library()

@register.simple_tag
def readable_role(role):
    roles = {
      'front-end': 'Front-end Developer' ,
      'back-end': 'Back-end Developer' ,
      'full-stack': 'Full-stack Developer' ,
      'mobile': 'Mobile Developer' ,
      'ios': 'iOS Developer',
      'android': 'Android Developer',
      'software': 'Software Developer',
      'game': 'Game Developer',
      'devops': 'Dev ops Engineer',
      'dev-ops': 'Dev ops Engineer',
      'database': 'Database Engineer',
      'qa': 'QA Engineer',
      'graphic-designer': 'Graphic Designer',
      'logo-designer': 'Logo/Brand Designer',
      'product-designer': 'Product Designer',
      'industrial-designer': 'Industrial Designer',
      'illustrator': 'Illustrator',
      'animator': 'Animator',
      'web-designer': 'Web Designer',
      'ux-ui-designer': 'UX/UI Designer',
      'motion-designer': 'Motion Designer',
      'print-designer': 'Print Designer',
      'presentation-designer': 'Presentation Designer',
      'packaging-designer': 'Packaging Designer'
    }

    if role in roles:
        return roles[role]

    return ''
