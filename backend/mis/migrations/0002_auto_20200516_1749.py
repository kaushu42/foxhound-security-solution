# Generated by Django 2.2.8 on 2020-05-16 17:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mis', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailysourceip',
            name='firewall_rule',
        ),
        migrations.DeleteModel(
            name='DailyDestinationIP',
        ),
        migrations.DeleteModel(
            name='DailySourceIP',
        ),
    ]
