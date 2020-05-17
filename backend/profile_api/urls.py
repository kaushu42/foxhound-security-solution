from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('sankey/', views.SankeyApiView.as_view()),
    path('average-daily/', views.AverageDailyApiView.as_view()),
    path('usage/', views.UsageApiView.as_view()),
    path('get_alias/', views.GetIPAliasApiView.as_view()),
    path('set_alias/', views.SetIPAliasApiView.as_view()),
]
