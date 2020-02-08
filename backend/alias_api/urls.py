from django.urls import path

from . import views
urlpatterns = [
    path('', views.IPAliasApiView.as_view()),
    path('edit/', views.SetIPAliasApiView.as_view()),
]
