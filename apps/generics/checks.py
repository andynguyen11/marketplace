import logging
import requests

from django.conf import settings
from django.db import DEFAULT_DB_ALIAS, connections
from django.db.migrations.loader import MigrationLoader


logger = logging.getLogger(__name__)

def page_response(path, expected_status=requests.codes.ok):
    """
    Make an internal (fake) HTTP request to check a page returns the expected
    status code.
    """
    #try:
    response = requests.get('http://{0}{1}'.format(settings.BASE_URL, path))
    #except Exception as e:
    #    return False

    result = response.status_code == expected_status
    #if not result:
    #    return False
    return result

def migrations_have_applied():
    """
    Check if there are any migrations that haven't been applied yet
    """
    connection = connections[DEFAULT_DB_ALIAS]
    loader = MigrationLoader(connection)
    graph = loader.graph

    # Count unapplied migrations
    num_unapplied_migrations = 0
    for app_name in loader.migrated_apps:
        for node in graph.leaf_nodes(app_name):
            for plan_node in graph.forwards_plan(node):
                if plan_node not in loader.applied_migrations:
                    num_unapplied_migrations += 1

    return num_unapplied_migrations == 0

