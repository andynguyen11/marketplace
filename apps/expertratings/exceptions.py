from rest_framework.exceptions import APIException

class ExpertRatingsAPIException(APIException):
    status_code = 500
    default_detail = 'ExpertRatings API misconfigured or temporarily unavailable'
