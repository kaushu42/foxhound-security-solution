# Generated by Django 2.2.8 on 2020-01-28 10:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('troubleticket', '0004_troubleticketanomaly_repeat_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='troubleticketanomaly',
            name='time_elapsed',
            field=models.IntegerField(default=0),
        ),
    ]