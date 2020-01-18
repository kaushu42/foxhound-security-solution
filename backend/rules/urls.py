from django.urls import path

from . import views_v1

urlpatterns = [
    path('all/', views_v1.RulesApiView.as_view()),
    path('verified/', views_v1.VerifiedRulesApiView.as_view()),
    path('unverified/', views_v1.UnverifiedRulesApiView.as_view()),
    path('anomalous/', views_v1.AnomalousRulesApiView.as_view()),
    path('verify/<int:id>/', views_v1.verify_rule),
    path('flag/<int:id>/', views_v1.flag_rule),
    path('edit/', views_v1.edit_rule),
]
