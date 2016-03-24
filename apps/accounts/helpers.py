import pytz

from datetime import datetime, timedelta

from rest_framework.authtoken.models import Token


def create_auth_token(user):
    token, created = Token.objects.get_or_create(user=user)

    utc_now = datetime.utcnow()
    utc_now = utc_now.replace(tzinfo=pytz.utc)

    if token.created < utc_now - timedelta(hours=48):
        token.delete()
        token = Token.objects.create(user=user)

    return token