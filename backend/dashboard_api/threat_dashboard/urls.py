from django.urls import path

from . import views

urlpatterns = [
    path('log/', views.ThreatLogTableApiView.as_view()),
    path('application/', views.ApplicationApiView.as_view()),
    path('country/', views.CountryApiView.as_view()),
    path('country_list/', views.CountryListApiView.as_view()),
    path('filters/', views.ThreatFiltersApiView.as_view()),
]
