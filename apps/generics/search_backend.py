from haystack.backends.elasticsearch_backend import ElasticsearchSearchBackend
from haystack.backends.elasticsearch_backend import ElasticsearchSearchQuery
from haystack.backends.elasticsearch_backend import ElasticsearchSearchEngine

def expand_query(query_string):
    return query_string\
            .replace('\/','/')\
            .replace('\\\\\~','~2')


class FuzzyBackend(ElasticsearchSearchBackend):
    def build_search_kwargs(self, query_string, **kwargs):
        query_string = expand_query(query_string)
        search_kwargs = super(FuzzyBackend, self).build_search_kwargs(
                query_string, **kwargs)
        return search_kwargs


class FuzzyElasticSearchEngine(ElasticsearchSearchEngine):
    backend = FuzzyBackend
