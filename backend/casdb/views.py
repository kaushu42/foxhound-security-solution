import os
from cassandra.cqlengine import connection
from cassandra.cqlengine.management import sync_table
from cassandra.cluster import Cluster
from django.http import JsonResponse
from globalutils.utils import get_tenant_id_from_token
from .tasks import get_traffic_log
from core.models import BackgroundJob
from .models import TrafficLogs


def index(request):
	tenant = 2
	task = get_traffic_log.delay()
	job = BackgroundJob.objects.create(
	tenant_id = tenant,
	task_id = task.id)
	return JsonResponse({"task_id":task.id})
	


