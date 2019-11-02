from django.urls import path

from . import views

urlpatterns = [
    path('anomaly/', views.TroubleTicketAnomalyApiView.as_view())
]
