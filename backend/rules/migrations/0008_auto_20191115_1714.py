# Generated by Django 2.2.5 on 2019-11-15 17:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rules', '0007_auto_20191115_1702'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rule',
            name='application',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='rule',
            name='destination_ip',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='rule',
            name='source_ip',
            field=models.CharField(max_length=50, null=True),
        ),
    ]