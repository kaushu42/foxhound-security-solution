from django.contrib import admin

from . import models

admin.site.register(models.TroubleTicketType)
admin.site.register(models.TroubleTicket)
admin.site.register(models.TroubleTicketFollowUp)
