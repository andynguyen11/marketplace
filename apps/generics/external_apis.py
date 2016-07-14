from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from multiprocessing import Pool

def external_record_upserter(serializer, primary_key='id', partial=True):
    """
    builds an `upsert` function designed to sync our records with those of an external api.
    `external_record_upserter(SkillTestSerializer, primary_key='test_id') #=> upsert(record)`
    """

    model = serializer.Meta.model

    def upsert(record):
        try:
            existing = model.objects.get(**{ primary_key: record[primary_key] })
            record_serializer = serializer(existing, data=record, partial=partial)
        except ObjectDoesNotExist, e: 
            record_serializer = serializer(data=record)

        try: 
            record_serializer.is_valid(raise_exception=True)
        except ValidationError, e:
            err = '\n'.join([
                key + ': ' + ', '.join(map(str, e.detail[key]))
                for key in e.detail.keys()
            ])
            raise ValidationError(err)

        return record_serializer.save()

    return upsert

class LazyClient(object):
    """ Wraps a synchronous api factory in an async process, then acts as a pass through after the factory returns.
        Good for external apis that require some time-consuming login call/response """

    def _get(self, name):
        return object.__getattribute__(self, name)

    def _normalize(self):
        self._get('thread').wait(self._get('timeout'))
        self._client = self._get('thread').get()
        self._get('pool').close()

    def __init__(self, function, timeout=30):
        self._client = None
        self.pool = Pool(processes=1)
        self.timeout = 30
        self.thread = self._get('pool').apply_async(function)

    def __getattribute__(self, name):
        if name in ('_get', '_normalize', '_client'):
            return object.__getattribute__(self, name)
        if not self._get('_client'):
            self._normalize()
        return self._get('_client').__getattribute__(name)
