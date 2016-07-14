from django.conf import settings
import requests
from expertratings.utils import xml2dict, xml_body, upper_camel_case

#settings.WEBHOOK_BASE_URL + '/api/skilltests/webhook'
def quote(s): return '"%s"' % s

def coverage_format(c):
    return ', '.join(map(quote, str(c).split(' ;')))

record_schema = {
  '@category': str,
  '@coverage': coverage_format,
  '@duration': int,
  '@passing_marks': int,
  '@test_id': str,
  '@test_name': str,
  '@total_questions': int
}

def cast(k, v):
    t = record_schema.get(k, None)
    if t:
        return t(v)
    return v

def normalize_record(record):
    return { k[1:]: cast(k, v) for k, v in record.items()}

class ExpertRatings(object):

    def __init__(self,
            url     = settings.EXPERT_RATING['root_url'],
            options = { 'dev': 1, 'debug': 1, 'reuse': 1, },
            auth    = settings.EXPERT_RATING['auth']):
        self.url = url
        self.auth = auth
        self.options = options
        self.return_url = settings.BASE_URL

    def endpoint(self, tail):
        return self.url + tail

    def post(self, endpoint, *args, **kwargs):
        return requests.post(self.endpoint(endpoint), *args, **kwargs)

    def extract_records(self, xml_response_string):
        records = xml2dict(xml_response_string)['response']['result']['records']['record']
        if isinstance(records, list):
            return map(normalize_record, records)
        else: return normalize_record(records)
            

    def request( self, method, parameters=None ):
        method_body = {'name': method}
        if parameters:
            method_body['parameters'] = parameters
        data = xml_body({
            'request': {
                'authentication': self.auth,
                'method': method_body
            }
        })
        response = self.post('/', data=data, headers={'Content-Type': 'application/x-www-form-urlencoded'}) 
        return self.extract_records(response.text)

    def get( self, method, **kwargs ):
        return self.request('Get%s' % upper_camel_case(method), **kwargs)

    def create_ticket( self, test_id, user_id, options={} ):
        data = dict(
            testid = test_id,
            #user_id = user_id,
            returnURL = self.return_url,
            **self.auth
        )
        data['partneruserid'] = user_id
        data.update(self.options)
        data.update(options)
        response = self.post('/GenerateTicket.aspx', data=data)
        ticket_url = response.text
        if(ticket_url == 'SOMETHING MISSING IN URL'): # expert rating return 200 on errors
            raise AssertionError('incorrect parameters for expertrating call')
        return ticket_url

expertratings_api = ExpertRatings()
