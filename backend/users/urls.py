from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login),
    path('change-password/', views.change_password),
]
