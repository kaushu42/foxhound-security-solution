from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.stats),
    path('filters/', views.filters),
    path('rules/', views.rules),
    path('usage/', views.usage),
]
