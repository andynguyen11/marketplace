from apps.api.utils import set_jwt_token

class CheckJWT(object):
    # Check if client IP is allowed
    def process_response(self, request, response):
        if not request.COOKIES.get('loom_token', None) and request.user.is_authenticated():
            response = set_jwt_token(response, request.user)
        return response