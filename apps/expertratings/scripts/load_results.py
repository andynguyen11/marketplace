from generics.external_apis import external_record_upserter
from expertratings.serializers import SkillTestResultSerializer
from expertratings.api import expertratings_api

upsert = external_record_upserter(SkillTestResultSerializer, primary_key='transcript_id')

def load_result_list():
    return map(upsert, expertratings_api.get('all_user_tests_info', from_date='2016-08-29T03:14:25Z', to_date='2016-08-30T03:14:25Z'))

def run(): load_result_list()
