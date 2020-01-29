from django.urls import path

from . import views_v1, views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('activity/', views_v1.ActivityApiView.as_view()),
    path('sankey/', views_v1.SankeyApiView.as_view()),
    path('average-daily/', views_v1.AverageDailyApiView.as_view()),
    path('usage/', views.UsageApiView.as_view()),
    path('get_alias/', views_v1.GetIPAliasApiView.as_view()),
    path('set_alias/', views_v1.SetIPAliasApiView.as_view()),
    path('date/', views_v1.IPUsageByDateApiView.as_view()),
]
