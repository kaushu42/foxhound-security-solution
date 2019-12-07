from django.urls import path, include

urlpatterns = [
    path('users/', include('users.urls')),
    path('dashboard/', include('dashboard_api.urls')),
    path('profile/', include('profile_api.urls')),
    path('log/', include('log_api.urls')),
    path('tt/', include('troubleticket.urls')),
    path('session/', include('session.urls')),
    path('rules/', include('rules.urls')),
    path('alias/', include('alias_api.urls')),
]
