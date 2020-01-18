from django.urls import path
from . import views_v1

urlpatterns = [
    path('login/', views_v1.login),
    path('change-password/', views_v1.change_password),
]
