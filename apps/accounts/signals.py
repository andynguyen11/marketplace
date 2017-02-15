from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from accounts.models import Profile, ContactDetails
from generics.tasks import email_confirmation

def field_changed(instance, field, id_field='id'):
    try:
        return (not (hasattr(instance, id_field) and getattr(instance, id_field))) or (getattr(instance, field) != getattr(type(instance).objects.get(**{id_field: getattr(instance,id_field)}), field))
    except type(instance).DoesNotExist:
        return False

@receiver(pre_save, sender=Profile)
def profile_email_update_event(sender, instance, **kwargs):
    "linkedin emails are auto-verified on creation"
    if instance.id and field_changed(instance, 'email'):
        instance.email_confirmed = False
        email_confirmation(user=instance)

@receiver(post_save, sender=Profile)
def profile_email_confirmation_on_create(sender, instance, created, **kwargs):
    if (created and not instance.email_confirmed):
        email_confirmation(user=instance, template='verify-signup-email')

@receiver(pre_save, sender=ContactDetails)
def contact_email_update_event(sender, instance, **kwargs):
    if not instance.profile.id or field_changed(instance, field='email', id_field='profile_id') and not (
            instance.email == instance.profile.email):
        instance.email_confirmed = False
        email_confirmation(user=instance.profile, instance=instance)
