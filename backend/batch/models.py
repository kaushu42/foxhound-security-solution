from django.db import models

# Create your models here.


class Log(models.Model):
    start_date = models.DateTimeField(auto_now_add=True)
    log_name = models.CharField(max_length=500)
    batch_type = models.CharField(max_length=100)
    batch_sub_type = models.CharField(max_length=200)
    message = models.CharField(max_length=500)
    exit_message = models.CharField(max_length=1000)
    state = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    end_date = models.DateTimeField(auto_now=True)
