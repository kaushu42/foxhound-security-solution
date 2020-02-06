from django.urls import path

from . import views_v1, views

urlpatterns = [
    path('processed/', views.TrafficLogApiView.as_view()),
    path('detail/<int:id>/', views.TrafficLogDetailApiView.as_view()),
    path('request-origin/', views_v1.RequestOriginLogApiView.as_view()),
    path('request-end/', views_v1.RequestEndLogApiView.as_view()),
    path('application/', views_v1.ApplicationLogApiView.as_view()),
    path('sankey/', views_v1.SankeyLogApiView.as_view()),
]
