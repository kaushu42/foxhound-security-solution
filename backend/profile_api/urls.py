from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.stats),
    path('usage/', views.usage),
    path('activity/', views.activity),
]
