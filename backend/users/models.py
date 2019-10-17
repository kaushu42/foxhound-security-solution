from django.contrib.auth.models import AbstractUser
from django.db import models


class FoxhoundUser(AbstractUser):
    tenant_id = models.PositiveIntegerField(default=0)
