from generics.external_apis import external_record_upserter
from expertratings.serializers import SkillTestSerializer
from expertratings.api import expertratings_api

upsert = external_record_upserter(SkillTestSerializer, primary_key='test_id')

def load_test_list():
    return upsert(expertratings_api.get('test_list'))

def run(): load_test_list()
