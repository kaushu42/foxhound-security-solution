from django.urls import path

from . import views

urlpatterns = [
    path('tenant/', views.TenantInfoApiView.as_view()),
    path('user/', views.InfoApiView.as_view())
]
