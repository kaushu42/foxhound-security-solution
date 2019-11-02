from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('activity/', views.ActivityApiView.as_view()),
    path('sankey/', views.SankeyApiView.as_view()),
    path('average-daily/', views.AverageDailyApiView.as_view())
]
