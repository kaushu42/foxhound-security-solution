from django.urls import path

from . import views

urlpatterns = [
    path('', views.TrafficLogApiView.as_view()),
    path('<int:id>', views.TrafficLogDetailApiView.as_view()),
]
