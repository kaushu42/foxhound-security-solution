# Generated by Django 2.2.5 on 2020-05-11 19:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20200511_1905'),
    ]

    operations = [
        migrations.AddField(
            model_name='stagetrafficlogdetaildaily',
            name='vsys',
            field=models.CharField(max_length=3, null=True),
        ),
        migrations.AddField(
            model_name='stagetrafficlogdetailhourly',
            name='vsys',
            field=models.CharField(max_length=3, null=True),
        ),
        migrations.AddField(
            model_name='trafficlogdetaildaily',
            name='vsys',
            field=models.CharField(max_length=3, null=True),
        ),
        migrations.AddField(
            model_name='trafficlogdetailhourly',
            name='vsys',
            field=models.CharField(max_length=3, null=True),
        ),
    ]
