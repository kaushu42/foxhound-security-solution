# Generated by Django 2.2.5 on 2019-11-12 12:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rules', '0003_auto_20191112_1240'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rule',
            name='application',
            field=models.CharField(default='0', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='rule',
            name='destination_ip',
            field=models.CharField(default='0', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='rule',
            name='source_ip',
            field=models.CharField(default='0', max_length=50),
            preserve_default=False,
        ),
    ]