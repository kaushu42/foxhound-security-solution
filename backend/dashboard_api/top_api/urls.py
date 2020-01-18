from django.urls import path

from . import views_v1

urlpatterns = [
    path('source-address/', views_v1.SourceAddressApiView.as_view()),
    path('destination-address/', views_v1.DestinationAddressApiView.as_view()),
    path('application/', views_v1.ApplicationApiView.as_view()),
    path('port/', views_v1.PortApiView.as_view()),
]
