from django.http import HttpResponse
from django.shortcuts import render
from spark import Spark


# Create your views here.
def index(request):
	ss,sc,sqlc = Spark.initSparkSession()
	return HttpResponse("<h1>Hello Spark!</h1>")

