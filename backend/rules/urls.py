from django.urls import path

from . import views

urlpatterns = [
    path('all/', views.RulesApiView.as_view()),
    path('unverified/', views.unverified_rules),
    path('anomalous/', views.anomalous_rules),
    path('verify/<int:id>/', views.verify_rule),
    path('flag/<int:id>/', views.flag_rule),
    path('edit/', views.edit_rule),
]
