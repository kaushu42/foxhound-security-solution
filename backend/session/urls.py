from django.urls import path

from . import views_v1

urlpatterns = [
    path('tenant/', views_v1.TenantInfoApiView.as_view()),
    path('user/', views_v1.InfoApiView.as_view()),
    path('is_valid/', views_v1.IsTokenValidApiView.as_view())
]
