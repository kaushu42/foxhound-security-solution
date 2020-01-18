from django.urls import path, include

from . import views_v1

urlpatterns = [
    path('stats/', views_v1.StatsApiView.as_view()),
    path('filters/', views_v1.FiltersApiView.as_view()),
    path('countries/', views_v1.CountryListApiView.as_view()),
    path('usage/', views_v1.UsageApiView.as_view()),
    path('activity/', views_v1.ActivityApiView.as_view()),
    path('map/', views_v1.WorldMapApiView.as_view()),
    path('blacklist/', views_v1.BlacklistedIPAddressApiView.as_view()),
    path('ip-address/', views_v1.IPAddressApiView.as_view()),
    path('new-ip/', views_v1.NewIPAddressApiView.as_view()),
    path('top/', include('dashboard_api.top_api.urls')),
]
