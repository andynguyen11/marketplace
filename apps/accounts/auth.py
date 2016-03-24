from django.contrib.auth.backends import ModelBackend

from apps.accounts.models import Profile


class CaseInsensitiveModelBackend(ModelBackend):
  """
  By default ModelBackend does case _sensitive_ username authentication, which isn't what is
  generally expected.  This backend supports case insensitive username authentication.
  """
  def authenticate(self, username=None, password=None):
    try:
      user = Profile.objects.get(username__iexact=username)
      if user.check_password(password):
        return user
      else:
        return None
    except Profile.DoesNotExist:
      return None


class TokenBackend(ModelBackend):
  """
  By default ModelBackend does case _sensitive_ username authentication, which isn't what is
  generally expected.  This backend supports case insensitive username authentication.
  """
  def authenticate(self, username=None, password=None):
    try:
      user = Profile.objects.get(username__iexact=username)
      if user.check_password(password):
        return user
      else:
        return None
    except Profile.DoesNotExist:
      return None