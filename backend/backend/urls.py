from django.contrib import admin
from django.urls import path, include
from home.views import index as home_view

urlpatterns = [
    path('', include('home.urls')),
    path('admin/', admin.site.urls),
    path('api/v1/', include('apiv1.urls')),
    path('api/v2/', include('apiv2.urls')),
]
