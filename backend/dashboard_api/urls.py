from django.urls import path, include

from . import views

urlpatterns = [
    path('stats/', views.StatsApiView.as_view()),
    path('filters/', views.FiltersApiView.as_view()),
    path('usage/', views.UsageApiView.as_view()),
]
