# Generated by Django 2.2.8 on 2020-02-08 12:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mis', '0002_auto_20200208_1747'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailydestinationip',
            name='alias',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AddField(
            model_name='dailysourceip',
            name='alias',
            field=models.CharField(max_length=250, null=True),
        ),
    ]