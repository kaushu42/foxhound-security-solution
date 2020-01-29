from django.urls import path

from . import views_v1, views

urlpatterns = [
    path('all/', views.RulesApiView.as_view()),
    path('verified/', views.VerifiedRulesApiView.as_view()),
    path('unverified/', views.UnverifiedRulesApiView.as_view()),
    path('anomalous/', views.AnomalousRulesApiView.as_view()),
    path('verify/<int:id>/', views_v1.verify_rule),
    path('flag/<int:id>/', views_v1.flag_rule),
    path('edit/', views_v1.edit_rule),
]
