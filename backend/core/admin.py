from django.contrib import admin
from . import models

admin.site.register(models.VirtualSystem)
admin.site.register(models.Domain)
admin.site.register(models.Tenant)
admin.site.register(models.Zone)
admin.site.register(models.FirewallRule)
admin.site.register(models.Application)
admin.site.register(models.IPAddress)
admin.site.register(models.Country)
admin.site.register(models.Protocol)
admin.site.register(models.TrafficLog)
admin.site.register(models.TrafficLogDetail)
admin.site.register(models.ProcessedLogDetail)
admin.site.site_title = 'FoxHound Security Solutions'
admin.site.site_header = 'FoxHound'
