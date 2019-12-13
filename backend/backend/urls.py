from django.contrib import admin
from django.urls import path, include
from core import views
from casdb.views import index
urlpatterns = [
    path('cassandra',index),
    path('',views.index),
    path('admin/', admin.site.urls),
    path('api/v1/', include('apiv1.urls'))
]
