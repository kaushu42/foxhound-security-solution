from django.urls import path

from . import views

urlpatterns = [
    path('log/', views.ThreatLogTableApiView.as_view()),
    path('application/', views.ApplicationApiView.as_view()),
]
