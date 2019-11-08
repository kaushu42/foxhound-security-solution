from django.urls import path

from . import views

urlpatterns = [
    path('anomaly/', views.TroubleTicketAnomalyApiView.as_view()),
    path('users/', views.TroubleTicketUsersApiView.as_view()),
    path(
        'anomaly/<int:id>/',
        views.TroubleTicketFollowUpAnomalyApiView.as_view()
    )
]
