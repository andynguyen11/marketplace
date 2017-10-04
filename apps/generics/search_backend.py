from haystack.backends.elasticsearch_backend import ElasticsearchSearchBackend
from haystack.backends.elasticsearch_backend import ElasticsearchSearchQuery
from haystack.backends.elasticsearch_backend import ElasticsearchSearchEngine
from elasticsearch.exceptions import ConnectionError

def expand_query(query_string):
    return query_string.replace('\/','/').replace('\\\\\~','~2')

def mute_error(f):      
    def error_wrapper(*args, **kwargs):  
        try:  
            return f(*args, **kwargs)  
        except ConnectionError, e:
            print 'Elasticsearch ConnectionError: Likely offline'
        except Exception, e:
            print 'Unknown error:'
            print e

    return error_wrapper

class FuzzyBackend(ElasticsearchSearchBackend):
    def build_search_kwargs(self, query_string, **kwargs):
        query_string = expand_query(query_string)
        search_kwargs = super(FuzzyBackend, self).build_search_kwargs(
                query_string, **kwargs)
        return search_kwargs

    @mute_error
    def update(self, indexer, iterable, commit=True):
        super(FuzzyBackend, self).update(indexer, iterable, commit)

    @mute_error
    def remove(self, obj, commit=True):
        super(FuzzyBackend, self).remove(obj, commit)

    @mute_error
    def clear(self, models=[], commit=True):
        super(FuzzyBackend, self).clear(models, commit)


class FuzzyElasticSearchEngine(ElasticsearchSearchEngine):
    backend = FuzzyBackend

