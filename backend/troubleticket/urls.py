from django.urls import path

from . import views_v1

urlpatterns = [
    path('open/', views_v1.TroubleTicketAnomalyOpenApiView.as_view()),
    path('closed/', views_v1.TroubleTicketAnomalyClosedApiView.as_view()),
    path('close/<int:id>/', views_v1.close_tt),
    path('users/', views_v1.TroubleTicketUsersApiView.as_view()),
    path('anomaly/<int:id>/',
         views_v1.TroubleTicketFollowUpAnomalyApiView.as_view()),
    path('detail/<int:id>/', views_v1.TroubleTicketDetailApiView.as_view())
]
