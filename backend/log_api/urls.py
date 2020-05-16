from django.urls import path

from . import views

urlpatterns = [
    path('latest/traffic/', views.LatestTrafficLogDateApiView.as_view()),
    path('latest/threat/', views.LatestThreatLogDateApiView.as_view()),
    path('traffic/processed/', views.TrafficLogApiView.as_view()),
    path('threat/processed/', views.ProcessedThreatLogApiView.as_view()),
    path('detail/', views.TrafficLogDetailApiView.as_view()),
    path('request-origin/', views.RequestOriginLogApiView.as_view()),
    path('application/', views.ApplicationLogApiView.as_view()),
    path('threat/application/', views.ThreatApplicationLogApiView.as_view()),
    path('sankey/', views.SankeyLogApiView.as_view()),
    path('blacklist/', views.BlacklistLogApiView.as_view()),
]
