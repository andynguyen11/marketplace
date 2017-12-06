from datetime import datetime, timedelta

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from accounts.models import Profile, ContactDetails
from accounts.tasks import email_confirmation, password_updated, profile_being_viewed


@receiver(post_save, sender=Profile)
def profile_post_save(sender, instance, created, **kwargs):
    if (created and not instance.email_confirmed):
        email_confirmation(user=instance, template='verify-signup-email')

@receiver(pre_save, sender=Profile)
def profile_pre_save(sender, instance, **kwargs):
    if not hasattr(instance, 'id') or instance.id is None:
        return
    old_profile = Profile.objects.get(pk=instance.id)
    # Send email confirmation
    if instance.id and instance.email != old_profile.email:
        instance.email_confirmed = False
        email_confirmation(user=instance)
        return
    # Profile being noticed
    if not old_profile.tos and instance.tos and instance.email_confirmed:
        today = datetime.utcnow()
        profile_being_viewed.apply_async((instance.id, ), eta=today + timedelta(days=7))
        welcome_email.delay(instance.id)
