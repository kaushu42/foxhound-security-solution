from django.urls import path

from . import views

urlpatterns = [
    path('', views.LogApiView.as_view()),
]
