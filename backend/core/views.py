from django.http import HttpResponse
from django.shortcuts import render
# rom spark import Spark


# Create your views here.
def index(request):
    return HttpResponse("<h1>Hello foxhound</h1>")
