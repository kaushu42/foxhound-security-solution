from django.urls import path

from . import views_v1, views

urlpatterns = [
    path('open/', views.TroubleTicketAnomalyOpenApiView.as_view()),
    path('closed/', views.TroubleTicketAnomalyClosedApiView.as_view()),
    path('close/<int:id>/', views.close_tt),
    path('users/', views.TroubleTicketUsersApiView.as_view()),
    path('anomaly/<int:id>/',
         views_v1.TroubleTicketFollowUpAnomalyApiView.as_view()),
    path('detail/<int:id>/', views.TroubleTicketDetailApiView.as_view())
]
