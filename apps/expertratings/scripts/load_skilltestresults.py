from generics.external_apis import external_record_upserter
from expertratings.serializers import SkillTestResultSerializer
from expertratings.api import expertratings_api
from datetime import datetime
from generics.utils import normalize_key_suffixes
from accounts.models import Profile

def normalizer(record):
    transcript_id = record.pop('transcript_id')
    record = normalize_key_suffixes(record)
    record['transcript_id'] = transcript_id
    user = record.pop('user')
    try:
        record['user'] = int(user) 
    except ValueError, e: 
        record['user'] = Profile.objects.get(username='admin').id
    return record

upsert = external_record_upserter(SkillTestResultSerializer, primary_key='transcript_id', normalizers={normalizer})

def load_result_list():
    return upsert(expertratings_api.get('all_user_tests_info',
        from_date='2016-06-24T00:00:00Z', to_date=datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")))

def run(): load_result_list()
