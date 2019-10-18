from django.contrib import admin
from . import models


# Register your models here.
admin.site.register(models.VirtualSystem)
admin.site.register(models.RuleDictionary)
admin.site.register(models.Log)
