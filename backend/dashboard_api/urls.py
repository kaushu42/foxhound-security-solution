from django.urls import path, include

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
]
