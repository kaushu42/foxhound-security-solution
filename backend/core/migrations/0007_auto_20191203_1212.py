# Generated by Django 2.2.5 on 2019-12-03 12:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_auto_20191203_1210'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dblock',
            name='table_name',
            field=models.CharField(max_length=80, null=True, unique=True),
        ),
    ]