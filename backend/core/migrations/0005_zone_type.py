# Generated by Django 2.2.5 on 2019-11-05 17:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_auto_20191105_1757'),
    ]

    operations = [
        migrations.AddField(
            model_name='zone',
            name='type',
            field=models.BooleanField(default=0),
            preserve_default=False,
        ),
    ]
