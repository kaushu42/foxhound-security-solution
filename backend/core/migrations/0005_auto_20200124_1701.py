# Generated by Django 2.2.5 on 2020-01-24 17:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_auto_20200121_1905'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='backgroundjob',
            name='task',
        ),
        migrations.RemoveField(
            model_name='backgroundjob',
            name='tenant',
        ),
        migrations.DeleteModel(
            name='CeleryTaskmeta',
        ),
        migrations.DeleteModel(
            name='BackgroundJob',
        ),
        migrations.DeleteModel(
            name='CeleryTasksetmeta',
        ),
    ]
