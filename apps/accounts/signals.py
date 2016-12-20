from django.db.models.signals import pre_save
from django.dispatch import receiver
from accounts.models import Profile, ContactDetails
from generics.tasks import email_confirmation

def field_changed(instance, field, id_field='id'):
    return (not (hasattr(instance, id_field) and getattr(instance, id_field))) or (getattr(instance, field) != getattr(type(instance).objects.get(**{id_field: getattr(instance,id_field)}), field))

#TODO Reimplement after rethinking email confirmation on sign up in combo with welcome email
#@receiver(pre_save, sender=Profile)
#def profile_email_update_event(sender, instance, **kwargs):
#    if field_changed(instance, 'email'):
#        instance.email_confirmed = False
#        email_confirmation(user=instance, redirect='/profile')

@receiver(pre_save, sender=ContactDetails)
def contact_email_update_event(sender, instance, **kwargs):
    if not instance.profile.id or field_changed(instance, 'email', id_field='profile_id'):
        instance.email_confirmed = False
        email_confirmation(user=instance.profile, instance=instance)
