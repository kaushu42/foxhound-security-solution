from django.urls import path, include

urlpatterns = [
    path('users/', include('users.urls')),
    path('dashboard/', include('dashboard_api.urls')),
]