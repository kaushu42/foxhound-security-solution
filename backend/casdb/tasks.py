from celery import shared_task
from .models import TrafficLogs
# from django.db import connections
# connection = connections['cassandra']
from celery.signals import worker_process_init

@shared_task
def test(param):
    return 'The test task executed with argument "%s" ' % param

@worker_process_init.connect
def connect_db(**kwargs):
	connection.reconnect()

@shared_task
def get_traffic_log():
	objects = TrafficLogs.objects.get(id="5d19e826-9d3e-4bba-bef8-7aa5025be311")
	return objects.id