from django.urls import path

from . import views

urlpatterns = [
    path('source_ip/', views.DailySourceIpApiView.as_view()),
    path('destination_ip/', views.DailyDestinationIpApiView.as_view()),
    path('source_count/', views.SourceIPCountChart.as_view()),
    path('destination_count/', views.DestinationIPCountChart.as_view()),
]
