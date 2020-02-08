from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings

from celery.signals import worker_process_init, beat_init
from cassandra.cqlengine import connection
from cassandra.cqlengine.connection import (
    cluster as cql_cluster, session as cql_session)

    
def cassandra_init(**kwargs):
    """ Initialize a clean Cassandra connection. """
    if cql_cluster is not None:
        cql_cluster.shutdown()
    if cql_session is not None:
        cql_session.shutdown()
    connection.setup()

# Initialize worker context for both standard and periodic tasks.
worker_process_init.connect(cassandra_init)
beat_init.connect(cassandra_init) 

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
app = Celery('backend')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings',namespace='CELERY')
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))