from corsheaders.middleware import CorsMiddleware
from rest_framework_jwt.serializers import RefreshJSONWebTokenSerializer
from rest_framework_jwt.settings import api_settings

from apps.api.utils import set_jwt_token, jwt_payload_handler


jwt_decode_handler = api_settings.JWT_DECODE_HANDLER

class CheckJWT(CorsMiddleware):
    def process_response(self, request, response):
        #Check if JWT token is set for legacy users
        if hasattr(request, 'user') and request.user.is_authenticated():
            token = request.COOKIES.get('loom_token', None)
            new_payload = False
            if token:
                try:
                    payload = jwt_decode_handler(token)
                    orig_iat = payload.get('orig_iat')
                    new_payload = jwt_payload_handler(request.user)
                    new_payload['orig_iat'] = orig_iat
                except:
                    return super(CheckJWT, self).process_response(request, response)
            response = set_jwt_token(response, request.user, new_payload)
        return super(CheckJWT, self).process_response(request, response)
