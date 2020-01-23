from django.db import models

# Create your models here.


class Log(models.Model):
    start_date = models.DateTimeField(auto_now_add=True, null=True)
    log_name = models.CharField(max_length=500, null=True)
    batch_type = models.CharField(max_length=100, null=True)
    batch_sub_type = models.CharField(max_length=200, null=True)
    message = models.CharField(max_length=500, null=True)
    exit_message = models.CharField(max_length=1000, null=True)
    state = models.CharField(max_length=100, null=True)
    status = models.CharField(max_length=100, null=True)
    end_date = models.DateTimeField(auto_now=True, null=True)
