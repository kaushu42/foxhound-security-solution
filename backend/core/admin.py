from django.contrib import admin
from . import models

admin.site.register(models.VirtualSystem)
admin.site.register(models.Domain)
admin.site.register(models.Tenant)
admin.site.register(models.Zone)
admin.site.register(models.FirewallRule)
admin.site.register(models.Application)
admin.site.register(models.IPAddress)
admin.site.register(models.SessionEndReason)
admin.site.register(models.Interface)
admin.site.register(models.Action)
admin.site.register(models.Category)
admin.site.register(models.Country)
admin.site.register(models.Protocol)
admin.site.register(models.TrafficLog)
admin.site.register(models.TrafficLogDetail)
admin.site.register(models.ProcessedTrafficLogDetail)
admin.site.register(models.ProcessedThreatLogDetail)
admin.site.register(models.BlacklistedIP)
admin.site.register(models.Filter)
admin.site.register(models.TimeSeriesChart)
admin.site.site_title = 'FoxHound Security Solutions'
admin.site.site_header = 'FoxHound'
