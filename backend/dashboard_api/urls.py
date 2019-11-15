from django.urls import path, include

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('filters/', views.FiltersApiView.as_view()),
    path('countries/', views.CountryListApiView.as_view()),
    path('usage/', views.UsageApiView.as_view()),
    path('activity/', views.ActivityApiView.as_view()),
    path('map/', views.WorldMapApiView.as_view()),
    path('blacklist/', views.BlacklistedIPAddressApiView.as_view()),
    path('ip-address/', views.IPAddressApiView.as_view()),
    path('new-ip/', views.NewIPAddressApiView.as_view()),
    path('top/', include('dashboard_api.top_api.urls')),
]
