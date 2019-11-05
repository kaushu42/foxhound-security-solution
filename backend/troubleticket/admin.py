from django.contrib import admin

from . import models

admin.site.register(models.TroubleTicketAnomaly)
admin.site.register(models.TroubleTicketFollowUpAnomaly)
