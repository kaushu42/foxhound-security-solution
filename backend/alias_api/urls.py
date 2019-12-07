from django.urls import path

from . import views
urlpatterns = [
    path('', views.IPAliasApiView.as_view()),
]
