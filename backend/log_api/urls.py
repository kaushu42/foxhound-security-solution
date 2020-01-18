from django.urls import path

from . import views_v1

urlpatterns = [
    path('', views_v1.TrafficLogApiView.as_view()),
    path('<int:id>/', views_v1.TrafficLogDetailApiView.as_view()),
    path('request-origin/', views_v1.RequestOriginLogApiView.as_view()),
    path('request-end/', views_v1.RequestEndLogApiView.as_view()),
    path('application/', views_v1.ApplicationLogApiView.as_view()),
    path('sankey/', views_v1.SankeyLogApiView.as_view()),
]
