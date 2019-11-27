from django.urls import path

from . import views

urlpatterns = [
    path('', views.TrafficLogApiView.as_view()),
    path('<int:id>/', views.TrafficLogDetailApiView.as_view()),
    path('request-origin/', views.RequestOriginLogApiView.as_view()),
    path('request-end/', views.RequestEndLogApiView.as_view()),
    path('application/', views.ApplicationLogApiView.as_view()),
]
