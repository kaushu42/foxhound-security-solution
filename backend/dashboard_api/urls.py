from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('filters/', views.FilterApiView.as_view()),
    path('rules/', views.rules),
    path('usage/', views.UsageApiView.as_view()),
    path('activity/', views.ActivityApiView.as_view()),
]
