import json
from requests_aws4auth import AWS4Auth
from elasticsearch import RequestsHttpConnection, serializer, compat, exceptions

class JSONSerializerPython2(serializer.JSONSerializer):
    """Override elasticsearch library serializer to ensure it encodes utf characters during json dump.
    See original at: https://github.com/elastic/elasticsearch-py/blob/master/elasticsearch/serializer.py#L42
    A description of how ensure_ascii encodes unicode characters to ensure they can be sent across the wire
    as ascii can be found here: https://docs.python.org/2/library/json.html#basic-usage
    TAKEN FROM https://github.com/elastic/elasticsearch-py/issues/374
    """
    def dumps(self, data):
        if isinstance(data, compat.string_types):
            return data
        try:
            return json.dumps(data, default=self.default, ensure_ascii=True)
        except (ValueError, TypeError) as e:
            raise exceptions.SerializationError(data, e)

def kwargs(ENVIRONMENT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY):
    config = {
        'connection_class': RequestsHttpConnection,
        'serializer': JSONSerializerPython2() }
    if ENVIRONMENT != 'local':
        awsauth = AWS4Auth(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, 'us-west-2', 'es')
        config.update({
                'port': 443,
                'use_ssl': True,
                'verify_certs': True,
                'http_auth': awsauth })
    return config

