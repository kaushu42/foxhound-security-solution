# Generated by Django 2.2.5 on 2019-11-10 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20191108_1609'),
    ]

    operations = [
        migrations.AddField(
            model_name='ipaddress',
            name='alias',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
