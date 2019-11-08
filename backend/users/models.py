from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import Tenant


class FoxhoundUser(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True)
