from django.contrib import admin
from . import models

admin.site.register(models.VirtualSystem)
admin.site.register(models.RuleDictionary)
admin.site.register(models.TrafficLog)
admin.site.register(models.TrafficLogDetail)
