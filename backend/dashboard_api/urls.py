from django.urls import path, include

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('filters/', views.FiltersApiView.as_view()),
    path('usage/', views.UsageApiView.as_view()),
    path('application/', views.ApplicationApiView.as_view()),
    path('country/', views.CountryApiView.as_view()),
    path('country_list/', views.CountryListApiView.as_view()),
]
