from django.urls import path

from . import views_v1, views

urlpatterns = [
    path('all/', views.RulesApiView.as_view()),
    path('verified/', views.VerifiedRulesApiView.as_view()),
    path('unverified/', views.UnverifiedRulesApiView.as_view()),
    path('anomalous/', views.AnomalousRulesApiView.as_view()),
    path('verify/<int:id>/', views.verify_rule),
    path('flag/<int:id>/', views.flag_rule),
    path('edit/', views.edit_rule),
]
