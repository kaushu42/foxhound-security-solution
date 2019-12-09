from django.contrib import admin
from django.urls import path, include
from core import views
urlpatterns = [
	path('',views.index),
    path('admin/', admin.site.urls),
    path('api/v1/', include('apiv1.urls'))
]
