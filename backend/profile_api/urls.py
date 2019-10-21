from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('usage/', views.UsageApiView.as_view()),
    path('activity/', views.ActivityApiView.as_view()),
]
