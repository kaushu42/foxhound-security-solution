from django.urls import path

from . import views_v1, views

urlpatterns = [
    path('latest/', views.LatestLogDate.as_view()),
    path('processed/', views.TrafficLogApiView.as_view()),
    path('detail/<int:id>/', views.TrafficLogDetailApiView.as_view()),
    path('request-origin/', views.RequestOriginLogApiView.as_view()),
    path('request-end/', views_v1.RequestEndLogApiView.as_view()),
    path('application/', views.ApplicationLogApiView.as_view()),
    path('threat/application/', views.ThreatApplicationLogApiView.as_view()),
    path('sankey/', views.SankeyLogApiView.as_view()),
    path('blacklist/', views.BlacklistLogApiView.as_view()),
]
