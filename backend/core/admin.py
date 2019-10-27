from django.contrib import admin
from . import models

admin.site.register(models.VirtualSystem)
admin.site.register(models.RuleDictionary)
admin.site.register(models.TrafficLog)
admin.site.register(models.TrafficLogDetail)
admin.site.site_title = 'FoxHound Security Solutions'
admin.site.site_header = 'FoxHound'
