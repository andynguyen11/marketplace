import jwt
import uuid
import warnings
from calendar import timegm
from datetime import datetime

from rest_framework_jwt.compat import get_username, get_username_field
from rest_framework_jwt.settings import api_settings

from accounts.serializers import ProfileSerializer


def jwt_response_payload_handler(token, user=None, request=None):
    """
    Returns the response data for both the login and refresh views.
    Override to return a custom response such as including the
    serialized representation of the User.
    Example:
    def jwt_response_payload_handler(token, user=None, request=None):
        return {
            'token': token,
            'user': UserSerializer(user, context={'request': request}).data
        }
    """
    return {
        'token': token,
        'user': ProfileSerializer(user, context={'request': request}).data
    }

def jwt_payload_handler(user):
    username_field = get_username_field()
    username = get_username(user)

    warnings.warn(
        'The following fields will be removed in the future: '
        '`email` and `user_id`. ',
        DeprecationWarning
    )

    payload = {
        'user_id': user.pk,
        'company_id': user.company.id if user.company else None,
        'connected': True if user.stripe_connect else False,
        'verification': user.verification,
        'payouts_enabled': user.payouts_enabled,
        'email': user.email,
        'username': username,
        'photo': user.get_photo,
        'last_name': user.last_name,
        'email_confirmed': user.email_confirmed,
        'tos': user.tos,
        'exp': datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA
    }
    if isinstance(user.pk, uuid.UUID):
        payload['user_id'] = str(user.pk)

    payload[username_field] = username

    # Include original issued at time for a brand new token,
    # to allow token refresh
    if api_settings.JWT_ALLOW_REFRESH:
        payload['orig_iat'] = timegm(
            datetime.utcnow().utctimetuple()
        )

    if api_settings.JWT_AUDIENCE is not None:
        payload['aud'] = api_settings.JWT_AUDIENCE

    if api_settings.JWT_ISSUER is not None:
        payload['iss'] = api_settings.JWT_ISSUER

    return payload

def set_jwt_token(response, user, payload=None):
    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
    if not payload:
        payload = jwt_payload_handler(user)
    token = jwt_encode_handler(payload)
    response.set_cookie(key='loom_token', value=token)
    return response

