from django.urls import path

from . import views

urlpatterns = [
    path('source-address/', views.SourceAddressApiView.as_view()),
    path('destination-address/', views.DestinationAddressApiView.as_view()),
    path('application/', views.ApplicationApiView.as_view()),
    path('port/', views.PortApiView.as_view()),
]
