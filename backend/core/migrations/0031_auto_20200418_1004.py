# Generated by Django 2.2.5 on 2020-04-18 04:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0030_auto_20200417_2324'),
    ]

    operations = [
        migrations.AlterField(
            model_name='threatlog',
            name='log_name',
            field=models.CharField(max_length=200, unique=True),
        ),
        migrations.AlterField(
            model_name='trafficlog',
            name='log_name',
            field=models.CharField(max_length=200, unique=True),
        ),
    ]
