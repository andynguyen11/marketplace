from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from accounts.models import Profile, ContactDetails
from accounts.tasks import email_confirmation, password_updated

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


@receiver(pre_save, sender=Profile)
def new_account(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_profile = Profile.objects.get(pk=instance.id)

    if not old_profile.tos and instance.tos and instance.email_confirmed:
        if not instance.work_examples:
            today = datetime.utcnow()
            add_work_examples.apply_async((instance.id, ), eta=today + timedelta(days=7))
