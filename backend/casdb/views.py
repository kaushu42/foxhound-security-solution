import os
# from cassandra.cqlengine import connection
# from cassandra.cqlengine.management import sync_table
# from cassandra.cluster import Cluster

from django.http import HttpResponse


def index(request):
    cluster = Cluster(os.environ.get('CASSANDRA_NODES').split(","))
    session = cluster.connect()
    session.set_keyspace('casdb')
    insert = ExampleModel(description="Hello world description")
    insert.save()
    cluster.shutdown()
    return HttpResponse("Hello world")
