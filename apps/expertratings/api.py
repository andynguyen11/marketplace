from django.conf import settings
import requests, re
from expertratings.utils import xml2dict, xml_body, upper_camel_case
from expertratings.exceptions import ExpertRatingsAPIException

#settings.WEBHOOK_BASE_URL + '/api/skilltests/webhook'
def quote(s): return '"%s"' % s

def coverage_format(c):
    return ', '.join(map(quote, str(c).split(' ;')))

def is_url(string):
    url_pattern = 'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.match(url_pattern, string) and True or False

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

    def extract_records(self, response_dict):
        records = response_dict['response']['result']['records']['record']
        if isinstance(records, list):
            return map(normalize_record, records)
        else: return normalize_record(records)
            

    def request( self, method, **parameters ):
        method_body = {'name': method}
        if len(parameters.keys()):
            method_body['parameters'] = [{ 'parameter': {
                'name': key,
                '_text': val
                } } for key, val in parameters.items()]
        data = xml_body({
            'request': {
                'authentication': self.auth,
                'method': method_body
            }
        })
        response = self.post('/', data=data, headers={'Content-Type': 'application/x-www-form-urlencoded'}) 
        response_dict = xml2dict(response.text)
        try:
            return self.extract_records(response_dict)
        except KeyError, e:
            raise ExpertRatingsAPIException(response_dict)

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
        if not is_url(ticket_url):
            raise ExpertRatingsAPIException(detail='failed to create url: expertRatings API misconfigured or temporarily unavailable')
        if(ticket_url == 'SOMETHING MISSING IN URL'): # expert rating return 200 on errors
            raise AssertionError('incorrect parameters for expertrating call')
        return ticket_url

expertratings_api = ExpertRatings()
