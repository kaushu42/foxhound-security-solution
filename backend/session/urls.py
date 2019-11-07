from django.urls import path

from . import views

urlpatterns = [
    path('tenant_info/', views.TenantInfoApiView.as_view()),
    path('token_validator/', views.TokenValidatorApiView.as_view()),
    path('info/', views.InfoApiView.as_view()),
]
