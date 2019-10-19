from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login),
    path('home/', views.user_info),
]
