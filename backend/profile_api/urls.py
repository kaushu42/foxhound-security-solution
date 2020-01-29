from django.urls import path

from . import views_v1

urlpatterns = [
    path('stats/', views_v1.StatsApiView.as_view()),
    path('activity/', views_v1.ActivityApiView.as_view()),
    path('sankey/', views_v1.SankeyApiView.as_view()),
    path('average-daily/', views_v1.AverageDailyApiView.as_view()),
    path('time-series/', views_v1.TimeSeriesApiView.as_view()),
    path('get_alias/', views_v1.GetIPAliasApiView.as_view()),
    path('set_alias/', views_v1.SetIPAliasApiView.as_view()),
    path('date/', views_v1.IPUsageByDateApiView.as_view()),
]
