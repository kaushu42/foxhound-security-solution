# Generated by Django 2.2.5 on 2020-01-13 16:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_applicationchart_filter_ipchart_requestoriginchart_stagingfilter_timeserieschart'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='celerytaskmeta',
            options={'managed': False},
        ),
        migrations.AlterModelOptions(
            name='celerytasksetmeta',
            options={'managed': False},
        ),
    ]
