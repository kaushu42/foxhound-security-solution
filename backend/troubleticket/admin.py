from django.contrib import admin

from . import models

admin.site.register(models.TroubleTicketAnomaly)
admin.site.register(models.TroubleTicketFollowUpAnomaly)
admin.site.register(models.TroubleTicketGroupAnomaly)
admin.site.register(models.TroubleTicketGroupFollowUpAnomaly)
