# Generated by Django 2.2.5 on 2019-11-14 16:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_auto_20191114_1523'),
    ]

    operations = [
        migrations.RenameField(
            model_name='tenantapplicationinfo',
            old_name='created_datetime',
            new_name='created_date',
        ),
        migrations.RenameField(
            model_name='tenantipaddressinfo',
            old_name='created_datetime',
            new_name='created_date',
        ),
    ]
