# Generated by Django 2.2.8 on 2020-01-04 06:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_auto_20200104_0658'),
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