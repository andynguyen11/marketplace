from django.http import HttpResponse
from rest_framework.parsers import BaseParser
from rest_framework.views import APIView
from expertratings.utils import xml2dict, xml_body
from expertratings.serializers import SkillTestSerializer, SkillTestResultSerializer, SkillTestUserFeedbackSerializer
from expertratings.models import SkillTest
from rest_framework.viewsets import ReadOnlyModelViewSet

class SkillTestViewSet(ReadOnlyModelViewSet):
    queryset = SkillTest.objects.all()
    serializer_class = SkillTestSerializer


class RawXMLParser(BaseParser):
    "ExpertRatings uses raw xml bodies with incorrect headers"
    media_type = 'application/x-www-form-urlencoded'
    def parse(self, stream, media_type=None, parser_context=None):
        return stream.read()

def get_test_result(**kwargs):
    return SkillTestResultSerializer.Meta.model.objects.get(**kwargs)

class ExpertRatingsXMLWebhook(APIView):

    parser_classes = (RawXMLParser, )

    serializer_map = {
        "SubmitUserTestResult": SkillTestResultSerializer,
        "SubmitUserTestFeedback": SkillTestUserFeedbackSerializer
    }

    def respond(self, **kwargs):
        body = xml_body({
            'response': {
                'info': kwargs
            }
        })
        return HttpResponse(body, content_type = 'application/x-www-form-urlencoded')


    def extract_request(self, data):
        return xml2dict(data)['request']['method']

    def serialize(self, parsed):
        parameters = parsed['parameters'] 
        method = parsed['@name'] 
        test = int(parameters.pop('test_id'))
        user = int(parameters.pop('user_id'))
        if method == "SubmitUserTestFeedback":
            parameters['test_result'] = get_test_result(user=user, test=test).pk
        else:
            parameters['test'] = test
            parameters['user'] = user
        serializer = self.serializer_map.get(method, None)
        record_serializer = serializer(data=parameters)
        record_serializer.is_valid(raise_exception=True)
        return record_serializer.save()

    def post(self, request, format=None):
        parsed = self.extract_request(request.data)
        response = {
            'success': 1,
            'transcript_id': parsed['parameters']['transcript_id']
        }
        try:
            self.serialize(parsed)
        except Exception, e:
            response['success'] = 0
            response['error'] =  str(e)
        return self.respond(**response)


