# Generated by Django 2.2.8 on 2020-02-26 07:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_auto_20200218_1933'),
    ]

    operations = [
        migrations.RenameField(
            model_name='threatlogdetail',
            old_name='ip_protocol',
            new_name='protocol',
        ),
    ]